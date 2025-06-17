/**
 * Edge Search Client
 * 
 * Client-side interface for the EdgeWorkers search service.
 * Provides search, autocomplete, and analytics functionality.
 */

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
  took: number;
  suggestions?: string[];
}

export interface AutocompleteEntry {
  text: string;
  type: 'keyword' | 'title' | 'tag' | 'author';
  weight: number;
}

export interface SearchOptions {
  type?: 'all' | 'articles' | 'topics' | 'pages';
  tags?: string[];
  author?: string;
  limit?: number;
  offset?: number;
  autocomplete?: boolean;
}

export class EdgeSearchClient {
  private baseUrl: string;
  private cache = new Map<string, { data: any; expires: number }>();
  private readonly cacheTimeout = 60000; // 1 minute

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Perform a search query
   */
  async search(query: string, options: SearchOptions = {}): Promise<SearchResponse> {
    if (!query.trim()) {
      return {
        query,
        results: [],
        total: 0,
        took: 0
      };
    }

    const cacheKey = this.getCacheKey('search', query, options);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const params = new URLSearchParams({
      q: query.trim(),
      ...options.type && { type: options.type },
      ...options.tags && { tags: options.tags.join(',') },
      ...options.author && { author: options.author },
      ...options.limit && { limit: options.limit.toString() },
      ...options.offset && { offset: options.offset.toString() },
      ...options.autocomplete !== undefined && { autocomplete: options.autocomplete.toString() }
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/search?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=60'
        }
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      console.error('Search error:', error);
      
      // Return fallback results on error
      return {
        query,
        results: [],
        total: 0,
        took: 0,
        error: error instanceof Error ? error.message : 'Search service unavailable'
      };
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(query: string): Promise<AutocompleteEntry[]> {
    if (!query.trim() || query.length < 2) {
      return [];
    }

    const cacheKey = this.getCacheKey('autocomplete', query);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached.suggestions || [];

    try {
      const params = new URLSearchParams({ q: query.trim() });
      const response = await fetch(`${this.baseUrl}/api/search/autocomplete?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=300' // 5 minutes
        }
      });

      if (!response.ok) {
        throw new Error(`Autocomplete failed: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data.suggestions || [];

    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<any> {
    const cacheKey = 'search_stats';
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/api/search/stats`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'public, max-age=300'
        }
      });

      if (!response.ok) {
        throw new Error(`Stats failed: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data, 300000); // 5 minutes
      return data;

    } catch (error) {
      console.error('Search stats error:', error);
      return null;
    }
  }

  /**
   * Check search service health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/search/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      return response.ok;
    } catch (error) {
      console.error('Search health check failed:', error);
      return false;
    }
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Generate cache key
   */
  private getCacheKey(type: string, query: string, options?: any): string {
    const key = `${type}:${query}`;
    if (options) {
      const optionsStr = JSON.stringify(options);
      return `${key}:${btoa(optionsStr)}`;
    }
    return key;
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  /**
   * Set data in cache with expiration
   */
  private setCache(key: string, data: any, timeout: number = this.cacheTimeout): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + timeout
    });

    // Cleanup expired entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Remove expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expires <= now) {
        this.cache.delete(key);
      }
    }
  }
}

// Create default client instance
export const edgeSearch = new EdgeSearchClient();

/**
 * Search hook for Svelte components
 */
export function createSearchStore(initialQuery: string = '') {
  let query = $state(initialQuery);
  let results = $state<SearchResult[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let total = $state(0);
  let took = $state(0);

  async function search(newQuery: string, options?: SearchOptions) {
    if (newQuery === query && results.length > 0) return;

    query = newQuery;
    loading = true;
    error = null;

    try {
      const response = await edgeSearch.search(query, options);
      results = response.results;
      total = response.total;
      took = response.took;
      
      if ('error' in response) {
        error = response.error as string;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Search failed';
      results = [];
      total = 0;
    } finally {
      loading = false;
    }
  }

  function clear() {
    query = '';
    results = [];
    error = null;
    total = 0;
    took = 0;
  }

  return {
    get query() { return query; },
    get results() { return results; },
    get loading() { return loading; },
    get error() { return error; },
    get total() { return total; },
    get took() { return took; },
    search,
    clear
  };
}

/**
 * Autocomplete hook for Svelte components
 */
export function createAutocompleteStore() {
  let query = $state('');
  let suggestions = $state<AutocompleteEntry[]>([]);
  let loading = $state(false);

  let debounceTimer: number;

  function updateQuery(newQuery: string) {
    query = newQuery;
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (newQuery.length < 2) {
      suggestions = [];
      return;
    }

    loading = true;
    debounceTimer = window.setTimeout(async () => {
      try {
        suggestions = await edgeSearch.autocomplete(newQuery);
      } catch (error) {
        console.error('Autocomplete error:', error);
        suggestions = [];
      } finally {
        loading = false;
      }
    }, 300); // 300ms debounce
  }

  function clear() {
    query = '';
    suggestions = [];
    loading = false;
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
  }

  return {
    get query() { return query; },
    get suggestions() { return suggestions; },
    get loading() { return loading; },
    updateQuery,
    clear
  };
}