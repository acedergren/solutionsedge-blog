/**
 * Search Service EdgeWorker
 * 
 * Provides high-performance search capabilities with:
 * - Full-text search
 * - Autocomplete suggestions
 * - Fuzzy matching
 * - Real-time indexing
 * - Search analytics
 */

import { EdgeSearchEngine } from './search-engine.js';
import { SearchQuery, SearchResponse, SearchError } from './types.js';

class SearchServiceEdgeWorker {
  private searchEngine: EdgeSearchEngine;

  constructor() {
    this.searchEngine = new EdgeSearchEngine();
  }

  /**
   * Main EdgeWorker entry point
   */
  async onClientRequest(request: EW.IngressClientRequest): Promise<EW.IngressRequestResponse | void> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Only handle search API requests
    if (!path.startsWith('/api/search')) {
      return; // Let other requests pass through
    }

    try {
      switch (path) {
        case '/api/search':
          return await this.handleSearch(request, url);
        case '/api/search/autocomplete':
          return await this.handleAutocomplete(request, url);
        case '/api/search/stats':
          return await this.handleSearchStats(request);
        case '/api/search/health':
          return await this.handleHealthCheck();
        default:
          return this.errorResponse('Search endpoint not found', 404);
      }
    } catch (error) {
      console.error('Search service error:', error);
      return this.errorResponse('Search service error', 500);
    }
  }

  /**
   * Handle search requests
   */
  private async handleSearch(request: EW.IngressClientRequest, url: URL): Promise<EW.IngressRequestResponse> {
    if (request.method !== 'GET') {
      return this.errorResponse('Method not allowed', 405);
    }

    const query = this.parseSearchQuery(url);
    
    if (!query.q || query.q.trim().length === 0) {
      return this.errorResponse('Search query is required', 400);
    }

    if (query.q.length > 200) {
      return this.errorResponse('Search query too long', 400);
    }

    try {
      const results = await this.searchEngine.search(query);
      return this.jsonResponse(results);
    } catch (error) {
      console.error('Search execution error:', error);
      return this.errorResponse('Search failed', 500);
    }
  }

  /**
   * Handle autocomplete requests
   */
  private async handleAutocomplete(request: EW.IngressClientRequest, url: URL): Promise<EW.IngressRequestResponse> {
    if (request.method !== 'GET') {
      return this.errorResponse('Method not allowed', 405);
    }

    const query = url.searchParams.get('q') || '';
    
    if (!query || query.trim().length < 2) {
      return this.jsonResponse({ suggestions: [] });
    }

    if (query.length > 100) {
      return this.errorResponse('Query too long', 400);
    }

    try {
      const suggestions = await this.searchEngine.getAutocomplete(query);
      return this.jsonResponse({ 
        query,
        suggestions: suggestions.map(s => ({
          text: s.text,
          type: s.type,
          weight: s.weight
        }))
      });
    } catch (error) {
      console.error('Autocomplete error:', error);
      return this.errorResponse('Autocomplete failed', 500);
    }
  }

  /**
   * Handle search statistics requests
   */
  private async handleSearchStats(request: EW.IngressClientRequest): Promise<EW.IngressRequestResponse> {
    if (request.method !== 'GET') {
      return this.errorResponse('Method not allowed', 405);
    }

    try {
      const stats = await this.searchEngine.getSearchStats();
      
      if (!stats) {
        return this.jsonResponse({ 
          message: 'No search statistics available yet' 
        });
      }

      return this.jsonResponse({
        totalQueries: stats.totalQueries,
        avgResponseTime: Math.round(stats.avgResponseTime * 100) / 100,
        topQueries: Object.entries(stats.topQueries)
          .slice(0, 10)
          .map(([query, count]) => ({ query, count })),
        lastUpdated: stats.lastUpdated
      });
    } catch (error) {
      console.error('Stats retrieval error:', error);
      return this.errorResponse('Failed to get statistics', 500);
    }
  }

  /**
   * Handle health check requests
   */
  private async handleHealthCheck(): Promise<EW.IngressRequestResponse> {
    try {
      // Test basic search functionality
      const testQuery: SearchQuery = { 
        q: 'test', 
        limit: 1,
        autocomplete: false 
      };
      
      const startTime = Date.now();
      await this.searchEngine.search(testQuery);
      const responseTime = Date.now() - startTime;

      return this.jsonResponse({
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    } catch (error) {
      return this.errorResponse('Search service unhealthy', 503);
    }
  }

  /**
   * Parse search query from URL parameters
   */
  private parseSearchQuery(url: URL): SearchQuery {
    const params = url.searchParams;
    
    return {
      q: params.get('q') || '',
      type: (params.get('type') as any) || 'all',
      tags: params.get('tags')?.split(',').filter(Boolean) || [],
      author: params.get('author') || undefined,
      limit: Math.min(parseInt(params.get('limit') || '20'), 100),
      offset: Math.max(parseInt(params.get('offset') || '0'), 0),
      autocomplete: params.get('autocomplete') === 'true'
    };
  }

  /**
   * Create JSON response
   */
  private jsonResponse(data: any, status: number = 200): EW.IngressRequestResponse {
    return {
      status,
      headers: {
        'Content-Type': ['application/json'],
        'Cache-Control': ['public, max-age=60'], // Cache for 1 minute
        'Access-Control-Allow-Origin': ['*'],
        'Access-Control-Allow-Methods': ['GET'],
        'Access-Control-Allow-Headers': ['Content-Type']
      },
      body: JSON.stringify(data)
    };
  }

  /**
   * Create error response
   */
  private errorResponse(message: string, status: number = 400): EW.IngressRequestResponse {
    const error: SearchError = {
      error: 'SearchError',
      message
    };

    return {
      status,
      headers: {
        'Content-Type': ['application/json'],
        'Cache-Control': ['no-cache'],
        'Access-Control-Allow-Origin': ['*']
      },
      body: JSON.stringify(error)
    };
  }
}

// EdgeWorker entry point
export function onClientRequest(request: EW.IngressClientRequest): Promise<EW.IngressRequestResponse | void> {
  const searchService = new SearchServiceEdgeWorker();
  return searchService.onClientRequest(request);
}