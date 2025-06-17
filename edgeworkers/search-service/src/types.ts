/**
 * Type definitions for Edge Search Service
 */

export interface SearchableDocument {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  author: string;
  date: string;
  url: string;
  type: 'article' | 'topic' | 'page';
  boost: number; // Search ranking boost factor
}

export interface SearchIndex {
  documents: Record<string, SearchableDocument>;
  keywords: Record<string, string[]>; // keyword -> document IDs
  ngrams: Record<string, string[]>; // n-gram -> document IDs
  tags: Record<string, string[]>; // tag -> document IDs
  autocomplete: Record<string, AutocompleteEntry[]>;
  metadata: SearchIndexMetadata;
}

export interface AutocompleteEntry {
  text: string;
  type: 'keyword' | 'title' | 'tag' | 'author';
  weight: number;
  documentId?: string;
}

export interface SearchIndexMetadata {
  version: string;
  totalDocuments: number;
  lastUpdated: string;
  buildTime: number;
}

export interface SearchQuery {
  q: string; // Search query
  type?: 'all' | 'articles' | 'topics' | 'pages';
  tags?: string[];
  author?: string;
  limit?: number;
  offset?: number;
  autocomplete?: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  type: string;
  tags: string[];
  author: string;
  date: string;
  score: number;
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  field: 'title' | 'content' | 'excerpt';
  text: string;
  start: number;
  end: number;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  autocomplete?: AutocompleteEntry[];
  total: number;
  took: number; // Query time in ms
  suggestions?: string[];
}

export interface SearchError {
  error: string;
  message: string;
  query?: string;
}

export interface SearchConfig {
  maxResults: number;
  autocompleteLimit: number;
  highlightLength: number;
  cacheTimeout: number;
  fuzzyThreshold: number;
  boostTitle: number;
  boostTags: number;
  boostContent: number;
}

export interface IndexedTerm {
  term: string;
  frequency: number;
  documents: string[];
  positions: Record<string, number[]>; // documentId -> positions in document
}

export interface SearchStats {
  totalQueries: number;
  avgResponseTime: number;
  topQueries: Record<string, number>;
  lastUpdated: string;
}