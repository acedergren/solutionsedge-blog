/**
 * Edge Search Engine
 * High-performance search with autocomplete, fuzzy matching, and ranking
 */

import { EdgeKV } from './edgekv.js';
import {
  SearchableDocument,
  SearchIndex,
  SearchQuery,
  SearchResult,
  SearchResponse,
  AutocompleteEntry,
  SearchConfig,
  SearchHighlight,
  SearchStats
} from './types.js';

export class EdgeSearchEngine {
  private edgeKV: EdgeKV;
  private config: SearchConfig;
  private searchIndex: SearchIndex | null = null;
  private lastIndexLoad: number = 0;
  private readonly INDEX_CACHE_DURATION = 300000; // 5 minutes

  constructor() {
    this.edgeKV = new EdgeKV({ 
      namespace: 'solutionsedge', 
      group: 'search' 
    });

    this.config = {
      maxResults: 50,
      autocompleteLimit: 10,
      highlightLength: 150,
      cacheTimeout: 300, // 5 minutes
      fuzzyThreshold: 0.8,
      boostTitle: 3.0,
      boostTags: 2.0,
      boostContent: 1.0
    };
  }

  /**
   * Main search method
   */
  async search(query: SearchQuery): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      await this.ensureIndexLoaded();
      
      if (!this.searchIndex) {
        throw new Error('Search index not available');
      }

      const results = await this.performSearch(query);
      const autocomplete = query.autocomplete ? await this.getAutocomplete(query.q) : undefined;
      
      const response: SearchResponse = {
        query: query.q,
        results,
        autocomplete,
        total: results.length,
        took: Date.now() - startTime
      };

      // Track search stats
      await this.trackSearchStats(query.q, response.took);

      return response;

    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocomplete(query: string): Promise<AutocompleteEntry[]> {
    await this.ensureIndexLoaded();
    
    if (!this.searchIndex || !query.trim()) {
      return [];
    }

    const normalizedQuery = this.normalizeText(query.toLowerCase());
    const suggestions: AutocompleteEntry[] = [];
    
    // Search in autocomplete index
    for (const [term, entries] of Object.entries(this.searchIndex.autocomplete)) {
      if (term.startsWith(normalizedQuery)) {
        suggestions.push(...entries);
      }
    }

    // Sort by weight and relevance
    return suggestions
      .sort((a, b) => {
        const aRelevance = this.calculateRelevance(a.text, query);
        const bRelevance = this.calculateRelevance(b.text, query);
        return (b.weight + bRelevance) - (a.weight + aRelevance);
      })
      .slice(0, this.config.autocompleteLimit);
  }

  /**
   * Perform the actual search
   */
  private async performSearch(query: SearchQuery): Promise<SearchResult[]> {
    if (!this.searchIndex) return [];

    const searchTerms = this.tokenize(query.q);
    if (searchTerms.length === 0) return [];

    const candidateDocuments = this.findCandidateDocuments(searchTerms);
    const scoredResults = this.scoreDocuments(candidateDocuments, searchTerms, query);
    
    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || this.config.maxResults));
  }

  /**
   * Find documents that contain search terms
   */
  private findCandidateDocuments(searchTerms: string[]): Set<string> {
    const candidates = new Set<string>();
    
    if (!this.searchIndex) return candidates;

    for (const term of searchTerms) {
      // Exact matches
      const exactMatches = this.searchIndex.keywords[term] || [];
      exactMatches.forEach(docId => candidates.add(docId));

      // N-gram matches for partial words
      const ngrams = this.generateNgrams(term, 3);
      for (const ngram of ngrams) {
        const ngramMatches = this.searchIndex.ngrams[ngram] || [];
        ngramMatches.forEach(docId => candidates.add(docId));
      }

      // Fuzzy matches
      const fuzzyMatches = this.findFuzzyMatches(term);
      fuzzyMatches.forEach(docId => candidates.add(docId));
    }

    return candidates;
  }

  /**
   * Score and rank documents
   */
  private scoreDocuments(
    candidateDocuments: Set<string>, 
    searchTerms: string[], 
    query: SearchQuery
  ): SearchResult[] {
    const results: SearchResult[] = [];

    for (const docId of candidateDocuments) {
      const document = this.searchIndex!.documents[docId];
      if (!document) continue;

      // Apply type filter
      if (query.type && query.type !== 'all' && document.type !== query.type) {
        continue;
      }

      // Apply tag filter
      if (query.tags && query.tags.length > 0) {
        const hasMatchingTag = query.tags.some(tag => 
          document.tags.includes(tag)
        );
        if (!hasMatchingTag) continue;
      }

      // Apply author filter
      if (query.author && document.author.toLowerCase() !== query.author.toLowerCase()) {
        continue;
      }

      const score = this.calculateDocumentScore(document, searchTerms);
      const highlights = this.generateHighlights(document, searchTerms);

      results.push({
        id: document.id,
        title: document.title,
        excerpt: document.excerpt,
        url: document.url,
        type: document.type,
        tags: document.tags,
        author: document.author,
        date: document.date,
        score,
        highlights
      });
    }

    return results;
  }

  /**
   * Calculate document relevance score
   */
  private calculateDocumentScore(document: SearchableDocument, searchTerms: string[]): number {
    let score = 0;
    const titleTokens = this.tokenize(document.title.toLowerCase());
    const contentTokens = this.tokenize(document.content.toLowerCase());
    const tagTokens = document.tags.map(tag => tag.toLowerCase());

    for (const term of searchTerms) {
      // Title matches (highest weight)
      const titleMatches = titleTokens.filter(token => 
        token.includes(term) || this.calculateSimilarity(token, term) >= this.config.fuzzyThreshold
      ).length;
      score += titleMatches * this.config.boostTitle;

      // Tag matches (high weight)
      const tagMatches = tagTokens.filter(tag => 
        tag.includes(term) || this.calculateSimilarity(tag, term) >= this.config.fuzzyThreshold
      ).length;
      score += tagMatches * this.config.boostTags;

      // Content matches (base weight)
      const contentMatches = contentTokens.filter(token => 
        token.includes(term) || this.calculateSimilarity(token, term) >= this.config.fuzzyThreshold
      ).length;
      score += contentMatches * this.config.boostContent;
    }

    // Apply document boost
    score *= document.boost;

    // Penalize older content slightly
    const daysSincePublished = (Date.now() - new Date(document.date).getTime()) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.5, 1 - (daysSincePublished / 365)); // Decay over a year
    score *= recencyFactor;

    return score;
  }

  /**
   * Generate search highlights
   */
  private generateHighlights(document: SearchableDocument, searchTerms: string[]): SearchHighlight[] {
    const highlights: SearchHighlight[] = [];
    const fields = [
      { name: 'title' as const, text: document.title },
      { name: 'content' as const, text: document.content },
      { name: 'excerpt' as const, text: document.excerpt }
    ];

    for (const field of fields) {
      const fieldHighlights = this.findHighlightsInText(field.text, searchTerms, field.name);
      highlights.push(...fieldHighlights);
    }

    return highlights.slice(0, 5); // Limit highlights
  }

  /**
   * Find highlights in text
   */
  private findHighlightsInText(
    text: string, 
    searchTerms: string[], 
    field: 'title' | 'content' | 'excerpt'
  ): SearchHighlight[] {
    const highlights: SearchHighlight[] = [];
    const lowerText = text.toLowerCase();

    for (const term of searchTerms) {
      let startIndex = 0;
      
      while (true) {
        const index = lowerText.indexOf(term.toLowerCase(), startIndex);
        if (index === -1) break;

        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + term.length + 50);
        const highlightText = text.substring(start, end);

        highlights.push({
          field,
          text: highlightText,
          start: index - start,
          end: index - start + term.length
        });

        startIndex = index + 1;
        if (highlights.length >= 3) break; // Limit per field
      }
    }

    return highlights;
  }

  /**
   * Find fuzzy matches using Levenshtein distance
   */
  private findFuzzyMatches(term: string): string[] {
    if (!this.searchIndex) return [];
    
    const matches: string[] = [];
    
    for (const keyword of Object.keys(this.searchIndex.keywords)) {
      const similarity = this.calculateSimilarity(term, keyword);
      if (similarity >= this.config.fuzzyThreshold) {
        matches.push(...(this.searchIndex.keywords[keyword] || []));
      }
    }

    return matches;
  }

  /**
   * Calculate string similarity (Levenshtein distance based)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  /**
   * Calculate relevance for autocomplete
   */
  private calculateRelevance(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    
    if (lowerText.startsWith(lowerQuery)) return 10;
    if (lowerText.includes(lowerQuery)) return 5;
    return this.calculateSimilarity(lowerText, lowerQuery) * 3;
  }

  /**
   * Generate n-grams for partial matching
   */
  private generateNgrams(text: string, n: number): string[] {
    const ngrams: string[] = [];
    const normalized = this.normalizeText(text);
    
    for (let i = 0; i <= normalized.length - n; i++) {
      ngrams.push(normalized.substring(i, i + n));
    }
    
    return ngrams;
  }

  /**
   * Tokenize text into searchable terms
   */
  private tokenize(text: string): string[] {
    return this.normalizeText(text)
      .split(/\s+/)
      .filter(token => token.length > 2) // Ignore very short words
      .slice(0, 20); // Limit number of terms
  }

  /**
   * Normalize text for searching
   */
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  }

  /**
   * Ensure search index is loaded and current
   */
  private async ensureIndexLoaded(): Promise<void> {
    const now = Date.now();
    
    if (this.searchIndex && (now - this.lastIndexLoad) < this.INDEX_CACHE_DURATION) {
      return; // Index is still fresh
    }

    try {
      const indexData = await this.edgeKV.get('search_index');
      if (indexData) {
        this.searchIndex = JSON.parse(indexData);
        this.lastIndexLoad = now;
        console.log('Search index loaded:', this.searchIndex.metadata);
      } else {
        console.warn('No search index found in EdgeKV');
      }
    } catch (error) {
      console.error('Failed to load search index:', error);
      throw new Error('Search service unavailable');
    }
  }

  /**
   * Track search statistics
   */
  private async trackSearchStats(query: string, responseTime: number): Promise<void> {
    try {
      const statsKey = 'search_stats';
      const existingStats = await this.edgeKV.get(statsKey);
      
      let stats: SearchStats;
      if (existingStats) {
        stats = JSON.parse(existingStats);
      } else {
        stats = {
          totalQueries: 0,
          avgResponseTime: 0,
          topQueries: {},
          lastUpdated: new Date().toISOString()
        };
      }

      // Update statistics
      stats.totalQueries++;
      stats.avgResponseTime = (stats.avgResponseTime * (stats.totalQueries - 1) + responseTime) / stats.totalQueries;
      stats.topQueries[query] = (stats.topQueries[query] || 0) + 1;
      stats.lastUpdated = new Date().toISOString();

      // Keep only top 100 queries
      const topQueries = Object.entries(stats.topQueries)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 100)
        .reduce((obj, [query, count]) => ({ ...obj, [query]: count }), {});
      
      stats.topQueries = topQueries;

      await this.edgeKV.put(statsKey, JSON.stringify(stats), { ttl: 86400 }); // 24 hours
    } catch (error) {
      // Don't fail search if stats tracking fails
      console.warn('Failed to track search stats:', error);
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<SearchStats | null> {
    try {
      const statsData = await this.edgeKV.get('search_stats');
      return statsData ? JSON.parse(statsData) : null;
    } catch (error) {
      console.error('Failed to get search stats:', error);
      return null;
    }
  }
}