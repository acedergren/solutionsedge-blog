<script>
  import { format } from 'date-fns';
  
  export let data;
  
  const years = Object.keys(data.postsByYear).sort((a, b) => b - a);
</script>

<svelte:head>
  <title>Archives - The Solutions Edge</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <h1 class="font-display text-4xl font-bold mb-12">Archives</h1>
  
  {#each years as year}
    <section class="mb-12">
      <h2 class="font-display text-2xl font-semibold mb-6 text-md-dark-primary">
        {year}
      </h2>
      
      <div class="space-y-4">
        {#each data.postsByYear[year] as post}
          <article class="flex items-baseline gap-4 group">
            <time datetime={post.date} class="text-md-dark-on-surface-variant text-sm font-mono shrink-0">
              {format(new Date(post.date), 'MMM dd')}
            </time>
            <div class="flex-1">
              <a href="/{post.slug}" class="group-hover:text-md-dark-primary transition-colors">
                <h3 class="font-medium inline">{post.title}</h3>
              </a>
              <span class="md-chip ml-2 text-xs">
                {post.category}
              </span>
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/each}
</div>