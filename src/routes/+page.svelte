<script>
  import { format } from 'date-fns';
  
  export let data;
</script>

<svelte:head>
  <title>The Solutions Edge - Home</title>
</svelte:head>

<!-- Hero Section -->
<section class="md-surface-container-high py-16">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="font-display text-4xl md:text-5xl font-bold mb-4">The Solutions Edge</h1>
    <p class="text-xl text-on-surface-variant max-w-3xl">
      A Solutions Engineering, Cloud Security and Edge Computing Blog. 
      Here I discuss the ins and outs of the art of Solutions Engineering and tech topics related to my day-to-day job.
    </p>
  </div>
</section>

<!-- Main Content -->
<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Posts List -->
    <div class="lg:col-span-2">
      <h2 class="font-display text-2xl font-semibold mb-8">Latest Posts</h2>
      
      <div class="space-y-6">
        {#each data.posts as post}
          <article class="md-card group">
            <a href="/{post.slug}" class="block">
              <h3 class="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <div class="flex items-center gap-4 text-sm text-on-surface-variant mb-3">
                <time datetime={post.date}>
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                </time>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </div>
              <p class="text-on-surface-variant line-clamp-3">
                {post.excerpt}
              </p>
              <div class="mt-4">
                <span class="md-chip">
                  {post.category}
                </span>
              </div>
            </a>
          </article>
        {/each}
      </div>
    </div>

    <!-- Sidebar -->
    <aside class="lg:col-span-1">
      <!-- Categories -->
      <div class="md-card mb-6">
        <h3 class="font-display text-lg font-semibold mb-4">Categories</h3>
        <div class="space-y-2">
          {#each data.categories as category}
            <a 
              href="/category/{category.slug}" 
              class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span class="text-on-surface-variant">{category.name}</span>
              <span class="text-sm text-outline">{category.count}</span>
            </a>
          {/each}
        </div>
      </div>

      <!-- About -->
      <div class="md-card">
        <h3 class="font-display text-lg font-semibold mb-4">About the Author</h3>
        <p class="text-on-surface-variant text-sm">
          Alexander Cedergren is a Solutions Engineer specializing in cloud computing, 
          security, and edge technologies.
        </p>
      </div>
    </aside>
  </div>
</div>