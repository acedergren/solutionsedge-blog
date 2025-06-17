<!--
Enhanced Search Component with Edge Search Integration

Features:
- Edge search with local fallback
- Real-time autocomplete
- Search history
- Performance metrics
- Progressive enhancement
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { edgeSearch, createSearchStore, createAutocompleteStore } from '$lib/edge-search';
  import { getAllArticles } from '$lib/content';
  
  // Props
  export let showSearch = false;
  
  // Search stores
  const searchStore = createSearchStore();
  const autocompleteStore = createAutocompleteStore();
  
  // Local state
  let searchInput: HTMLInputElement;
  let isEdgeSearchAvailable = false;
  let searchMode: 'edge' | 'local' = 'local';
  let showAutocomplete = false;
  let selectedSuggestionIndex = -1;
  
  // Legacy fallback data
  let localResults: Array<{title: string, url: string}> = [];
  
  // Check Edge Search availability on mount
  onMount(async () => {
    if (browser) {
      isEdgeSearchAvailable = await edgeSearch.healthCheck();
      searchMode = isEdgeSearchAvailable ? 'edge' : 'local';
      console.log(`🔍 Search mode: ${searchMode} ${isEdgeSearchAvailable ? '(Edge Search available)' : '(Using local search)'}`);
    }
  });
  
  // Reactive search query handling
  $: if (autocompleteStore.query && searchMode === 'edge') {
    showAutocomplete = autocompleteStore.suggestions.length > 0;
  }
  
  /**
   * Handle search input with autocomplete
   */
  function handleSearchInput() {
    const query = searchInput.value.trim();
    
    if (searchMode === 'edge') {
      // Use edge autocomplete
      autocompleteStore.updateQuery(query);
    } else {
      // Use local search immediately
      performLocalSearch(query);
    }
  }
  
  /**
   * Execute search (triggered by enter or autocomplete selection)
   */
  async function executeSearch(query?: string) {
    const searchQuery = query || searchInput.value.trim();
    
    if (!searchQuery) return;
    
    showAutocomplete = false;
    selectedSuggestionIndex = -1;
    
    if (searchMode === 'edge') {
      // Use Edge Search
      await searchStore.search(searchQuery, {
        limit: 20,
        autocomplete: false
      });
    } else {
      // Use local search
      performLocalSearch(searchQuery);
    }
  }
  
  /**
   * Local search fallback (same as original logic)
   */
  function performLocalSearch(query: string) {
    if (!query.trim()) {
      localResults = [];
      return;
    }
    
    // Get all articles and search through them
    const articles = getAllArticles();
    const articleResults = articles
      .filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .map(article => ({
        title: article.title,
        url: `/article/${article.id}`,
        excerpt: article.excerpt,
        type: 'article',
        score: calculateLocalScore(article, query)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    
    // Also search through topics
    const topics = [
      { title: 'Cloud Infrastructure', url: '/topic/cloud-infrastructure' },
      { title: 'Edge Computing', url: '/topic/edge-computing' },
      { title: 'Kubernetes', url: '/topic/kubernetes' },
      { title: 'Security', url: '/topic/security' },
      { title: 'DevOps', url: '/topic/devops' },
      { title: 'AI/ML', url: '/topic/ai-ml' },
      { title: 'Automation', url: '/topic/automation' }
    ];
    
    const topicResults = topics
      .filter(topic => 
        topic.title.toLowerCase().includes(query.toLowerCase())
      )
      .map(topic => ({
        ...topic,
        excerpt: `Browse all ${topic.title.toLowerCase()} related articles`,
        type: 'topic',
        score: 5
      }));
    
    localResults = [...articleResults, ...topicResults];
  }
  
  /**
   * Calculate local search score
   */
  function calculateLocalScore(article: any, query: string): number {
    const lowerQuery = query.toLowerCase();
    let score = 0;
    
    // Title match (highest weight)
    if (article.title.toLowerCase().includes(lowerQuery)) score += 10;
    
    // Tag match (high weight)
    if (article.tags.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) score += 5;
    
    // Content match (base weight)
    if (article.excerpt.toLowerCase().includes(lowerQuery)) score += 2;
    
    return score;
  }
  
  /**
   * Handle keyboard navigation
   */
  function handleKeydown(event: KeyboardEvent) {
    if (!showAutocomplete || autocompleteStore.suggestions.length === 0) {
      if (event.key === 'Enter') {
        executeSearch();
      }
      return;
    }
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedSuggestionIndex = Math.min(
          selectedSuggestionIndex + 1,
          autocompleteStore.suggestions.length - 1
        );
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        break;
        
      case 'Enter':
        event.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const suggestion = autocompleteStore.suggestions[selectedSuggestionIndex];
          executeSearch(suggestion.text);
        } else {
          executeSearch();
        }
        break;
        
      case 'Escape':
        showAutocomplete = false;
        selectedSuggestionIndex = -1;
        searchInput.blur();
        break;
    }
  }
  
  /**
   * Select autocomplete suggestion
   */
  function selectSuggestion(suggestion: any) {
    executeSearch(suggestion.text);
  }
  
  /**
   * Close search interface
   */
  function closeSearch() {
    showSearch = false;
    searchStore.clear();
    autocompleteStore.clear();
    localResults = [];
    showAutocomplete = false;
    selectedSuggestionIndex = -1;
  }
  
  // Get current results based on search mode
  $: currentResults = searchMode === 'edge' ? searchStore.results : localResults.map(r => ({
    id: r.url,
    title: r.title,
    url: r.url,
    excerpt: r.excerpt || '',
    type: r.type || 'article',
    score: r.score || 0
  }));
  
  // Focus search input when shown
  $: if (showSearch && searchInput) {
    setTimeout(() => searchInput.focus(), 100);
  }
</script>

{#if showSearch}
  <!-- Search Interface -->
  <div class="search-overlay">
    <div class="search-container">
      <!-- Search Input -->
      <div class="search-input-container">
        <div class="search-input-wrapper">
          <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <input
            bind:this={searchInput}
            type="search"
            placeholder="Search articles, topics, and authors..."
            class="search-input"
            on:input={handleSearchInput}
            on:keydown={handleKeydown}
            autocomplete="off"
            spellcheck="false"
          />
          
          <button 
            class="search-close"
            on:click={closeSearch}
            aria-label="Close search"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Search Mode Indicator -->
        <div class="search-mode-indicator">
          <span class="mode-badge mode-{searchMode}">
            {searchMode === 'edge' ? '⚡ Edge Search' : '🏠 Local Search'}
          </span>
          {#if searchMode === 'edge' && (searchStore.took > 0)}
            <span class="search-timing">{searchStore.took}ms</span>
          {/if}
        </div>
      </div>
      
      <!-- Autocomplete Suggestions (Edge Search only) -->
      {#if showAutocomplete && searchMode === 'edge' && autocompleteStore.suggestions.length > 0}
        <div class="autocomplete-dropdown">
          {#each autocompleteStore.suggestions as suggestion, index}
            <button
              class="autocomplete-item"
              class:selected={index === selectedSuggestionIndex}
              on:click={() => selectSuggestion(suggestion)}
            >
              <span class="suggestion-icon">
                {#if suggestion.type === 'title'}📄
                {:else if suggestion.type === 'tag'}🏷️
                {:else if suggestion.type === 'author'}👤
                {:else}🔍{/if}
              </span>
              <span class="suggestion-text">{suggestion.text}</span>
              <span class="suggestion-type">{suggestion.type}</span>
            </button>
          {/each}
        </div>
      {/if}
      
      <!-- Search Results -->
      <div class="search-results">
        {#if searchMode === 'edge' && searchStore.loading}
          <div class="search-loading">
            <div class="loading-spinner"></div>
            <span>Searching...</span>
          </div>
        {/if}
        
        {#if searchMode === 'edge' && searchStore.error}
          <div class="search-error">
            <span>⚠️ {searchStore.error}</span>
            <button on:click={() => { searchMode = 'local'; performLocalSearch(searchInput.value); }}>
              Switch to local search
            </button>
          </div>
        {/if}
        
        {#if currentResults.length > 0}
          <div class="results-header">
            <span class="results-count">
              {searchMode === 'edge' ? searchStore.total : currentResults.length} results
              {#if searchMode === 'edge' && searchStore.query}for "{searchStore.query}"{/if}
            </span>
          </div>
          
          <div class="results-list">
            {#each currentResults as result}
              <a 
                href={result.url} 
                class="result-item"
                on:click={closeSearch}
              >
                <div class="result-header">
                  <h3 class="result-title">{result.title}</h3>
                  <span class="result-type">{result.type}</span>
                </div>
                {#if result.excerpt}
                  <p class="result-excerpt">{result.excerpt}</p>
                {/if}
                {#if searchMode === 'edge' && result.score}
                  <div class="result-meta">
                    <span class="result-score">Score: {result.score.toFixed(1)}</span>
                  </div>
                {/if}
              </a>
            {/each}
          </div>
        {:else if searchInput?.value.trim() && !searchStore.loading}
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>No results found</h3>
            <p>Try different keywords or check your spelling</p>
            {#if searchMode === 'edge'}
              <button on:click={() => { searchMode = 'local'; performLocalSearch(searchInput.value); }}>
                Try local search
              </button>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .search-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 2rem;
    padding-top: 10vh;
  }
  
  .search-container {
    background: var(--md-surface);
    border-radius: 1rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  :global(.dark) .search-container {
    background: var(--md-dark-surface);
  }
  
  .search-input-container {
    padding: 1.5rem;
    border-bottom: 1px solid var(--md-outline-variant);
  }
  
  :global(.dark) .search-input-container {
    border-color: var(--md-dark-outline-variant);
  }
  
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: var(--md-surface-variant);
    border-radius: 2rem;
    border: 2px solid transparent;
    transition: border-color 0.2s;
  }
  
  :global(.dark) .search-input-wrapper {
    background: var(--md-dark-surface-variant);
  }
  
  .search-input-wrapper:focus-within {
    border-color: var(--md-primary);
  }
  
  .search-icon {
    position: absolute;
    left: 1rem;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--md-on-surface-variant);
    pointer-events: none;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 3rem;
    background: transparent;
    border: none;
    outline: none;
    font-size: 1rem;
    color: var(--md-on-surface);
  }
  
  .search-input::placeholder {
    color: var(--md-on-surface-variant);
  }
  
  .search-close {
    position: absolute;
    right: 0.75rem;
    padding: 0.5rem;
    background: transparent;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    color: var(--md-on-surface-variant);
    transition: all 0.2s;
  }
  
  .search-close:hover {
    background: var(--md-surface-container);
    color: var(--md-on-surface);
  }
  
  .search-mode-indicator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    font-size: 0.875rem;
  }
  
  .mode-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-weight: 500;
    font-size: 0.75rem;
  }
  
  .mode-edge {
    background: linear-gradient(45deg, #3b82f6, #06b6d4);
    color: white;
  }
  
  .mode-local {
    background: var(--md-surface-variant);
    color: var(--md-on-surface-variant);
  }
  
  .search-timing {
    color: var(--md-on-surface-variant);
    font-size: 0.75rem;
  }
  
  .autocomplete-dropdown {
    border-bottom: 1px solid var(--md-outline-variant);
    max-height: 200px;
    overflow-y: auto;
  }
  
  .autocomplete-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .autocomplete-item:hover,
  .autocomplete-item.selected {
    background: var(--md-surface-variant);
  }
  
  .suggestion-icon {
    font-size: 0.875rem;
  }
  
  .suggestion-text {
    flex: 1;
    color: var(--md-on-surface);
  }
  
  .suggestion-type {
    color: var(--md-on-surface-variant);
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  
  .search-results {
    flex: 1;
    overflow-y: auto;
  }
  
  .search-loading,
  .search-error,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    text-align: center;
    color: var(--md-on-surface-variant);
  }
  
  .loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid var(--md-outline-variant);
    border-top: 2px solid var(--md-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  .no-results-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .results-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--md-outline-variant);
    background: var(--md-surface-container);
  }
  
  .results-count {
    font-size: 0.875rem;
    color: var(--md-on-surface-variant);
  }
  
  .results-list {
    padding: 0.5rem 0;
  }
  
  .result-item {
    display: block;
    padding: 1rem 1.5rem;
    text-decoration: none;
    color: inherit;
    border-bottom: 1px solid var(--md-outline-variant);
    transition: background 0.2s;
  }
  
  .result-item:hover {
    background: var(--md-surface-variant);
  }
  
  .result-item:last-child {
    border-bottom: none;
  }
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  
  .result-title {
    font-weight: 500;
    color: var(--md-on-surface);
    margin: 0;
    line-height: 1.4;
  }
  
  .result-type {
    font-size: 0.75rem;
    color: var(--md-on-surface-variant);
    text-transform: uppercase;
    font-weight: 500;
    flex-shrink: 0;
  }
  
  .result-excerpt {
    color: var(--md-on-surface-variant);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .result-meta {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--md-on-surface-variant);
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .search-overlay {
      padding: 1rem;
      padding-top: 5vh;
    }
    
    .search-container {
      max-height: 90vh;
    }
    
    .search-input-container {
      padding: 1rem;
    }
    
    .result-item {
      padding: 0.75rem 1rem;
    }
  }
</style>