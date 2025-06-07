<script>
  import { format } from 'date-fns';
  
  export let data;
</script>

<svelte:head>
  <title>{data.category.name} - The Solutions Edge</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Category Header -->
  <header class="mb-12">
    <h1 class="font-display text-4xl font-bold mb-4">
      Category: {data.category.name}
    </h1>
    <p class="text-md-dark-on-surface-variant">
      {data.posts.length} {data.posts.length === 1 ? 'post' : 'posts'} in this category
    </p>
  </header>

  <!-- Posts Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each data.posts as post}
      <article class="md-card group">
        <a href="/{post.slug}" class="block">
          <h2 class="font-display text-xl font-semibold mb-2 group-hover:text-md-dark-primary transition-colors">
            {post.title}
          </h2>
          <div class="flex items-center gap-4 text-sm text-md-dark-on-surface-variant mb-3">
            <time datetime={post.date}>
              {format(new Date(post.date), 'MMMM d, yyyy')}
            </time>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
          <p class="text-md-dark-on-surface-variant line-clamp-3">
            {post.excerpt}
          </p>
        </a>
      </article>
    {/each}
  </div>
</div>