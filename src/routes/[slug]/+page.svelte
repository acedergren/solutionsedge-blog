<script>
  import { format } from 'date-fns';
  
  export let data;
</script>

<svelte:head>
  <title>{data.post.title} - The Solutions Edge</title>
  <meta name="description" content={data.post.excerpt} />
</svelte:head>

<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Article Header -->
  <header class="mb-12">
    <h1 class="font-display text-4xl md:text-5xl font-bold mb-6">
      {data.post.title}
    </h1>
    
    <div class="flex items-center gap-6 text-md-dark-on-surface-variant">
      <time datetime={data.post.date} class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {format(new Date(data.post.date), 'MMMM d, yyyy')}
      </time>
      
      <span class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {data.post.readingTime} min read
      </span>
      
      <a href="/category/{data.post.category.toLowerCase().replace(/\s+/g, '-')}" class="md-chip">
        {data.post.category}
      </a>
    </div>
  </header>

  <!-- Article Content -->
  <div class="prose prose-invert max-w-none">
    {@html data.post.html}
  </div>

  <!-- Article Footer -->
  <footer class="mt-16 pt-8 border-t border-md-dark-outline-variant">
    <div class="flex items-center justify-between">
      <a href="/" class="md-button-text">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </a>
      
      <div class="flex items-center gap-4">
        <span class="text-sm text-md-dark-on-surface-variant">Share:</span>
        <button class="p-2 rounded-full hover:bg-md-dark-surface-container-high transition-colors" aria-label="Share on Twitter">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
          </svg>
        </button>
        <button class="p-2 rounded-full hover:bg-md-dark-surface-container-high transition-colors" aria-label="Share on LinkedIn">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"></path>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </button>
      </div>
    </div>
  </footer>
</article>