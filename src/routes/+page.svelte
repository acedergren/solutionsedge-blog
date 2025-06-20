<script lang="ts">
	import { getAllArticles } from '$lib/content';
	import type { Article, TrendingArticle } from '$lib/types';
	
	// Get actual articles from content system
	const allArticles = getAllArticles();
	
	// Use the first article as featured (or the one marked as featured)
	const featuredArticle = allArticles.find(a => a.featured) || allArticles[0];
	
	// Use remaining articles for the list
	const articles = allArticles.filter(a => a.id !== featuredArticle?.id);
	
	// For now, just use the same articles as trending (in real app, this would be based on views/engagement)
	const trendingArticles = allArticles.slice(0, 6).map((article, index) => ({
		number: String(index + 1).padStart(2, '0'),
		title: article.title,
		author: article.author.name,
		id: article.id
	}));
	
	// Extract unique topics from all articles
	const allTags = allArticles.flatMap(article => article.tags);
	const topics = [...new Set(allTags)].slice(0, 9);

	function getTopicSlug(topic: string): string {
		return topic.toLowerCase().replace(/[\s\/]/g, '-');
	}
	
	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	<title>The Solutions Edge - Where Cloud Meets Edge</title>
	<meta name="description" content="Expert insights on cloud computing, edge technologies, and modern solution architecture." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<!-- Hero Section with Featured Article -->
	{#if featuredArticle}
	<section class="section-spacing border-b border-md-outline dark:border-md-dark-outline" data-mpulse-section="hero" data-content-type="featured-article">
		<div class="grid lg:grid-cols-2 gap-8 items-center">
			<div>
				<h1 class="article-title-animated mb-4">
					<a href="/article/{featuredArticle.id}" class="hover:underline text-gradient">
						{featuredArticle.title}
					</a>
				</h1>
				<p class="article-subtitle text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
					{featuredArticle.excerpt}
				</p>
				<div class="flex items-center gap-4 mt-6">
					{#if featuredArticle.author.name === 'Alexander Cedergren'}
						<div class="author-avatar-ac">
							AC
						</div>
					{:else}
						<img 
							src={featuredArticle.author.avatar} 
							alt={featuredArticle.author.name}
							class="author-avatar"
						/>
					{/if}
					<div>
						<p class="author-name">{featuredArticle.author.name}</p>
						<p class="text-sm text-md-on-surface-variant">
							{formatDate(featuredArticle.publishedAt)} · {featuredArticle.readingTime} min read
						</p>
					</div>
				</div>
					<a href="/article/{featuredArticle.id}" class="md-button-expressive md-button-cloud inline-flex items-center px-6 py-3 mt-6 group">
					Read Article 
					<svg class="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				</a>
			</div>
			<div class="aspect-[16/9] overflow-hidden rounded-lg">
				<a href="/article/{featuredArticle.id}">
					<img 
						src={featuredArticle.imageUrl} 
						alt={featuredArticle.title}
						class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
					/>
				</a>
			</div>
		</div>
	</section>
	{/if}

	<!-- Main Content Grid -->
	<div class="grid lg:grid-cols-3 gap-8 py-8">
		<!-- Articles List -->
		<div class="lg:col-span-2 space-y-8" data-mpulse-section="article-list" data-content-type="article-listing">
		<div class="stagger-container animate">
			{#each articles as article}
				<article class="stagger-item article-card-elevated group content-reveal visible">
					<div class="flex items-start gap-4 mb-3">
						{#if article.author.name === 'Alexander Cedergren'}
							<div class="author-avatar-ac">
								AC
							</div>
						{:else}
							<img 
								src={article.author.avatar} 
								alt={article.author.name}
								class="author-avatar"
							/>
						{/if}
						<div class="flex-1">
							<p class="author-name">{article.author.name}</p>
							<p class="text-sm text-md-on-surface-variant">
								{formatDate(article.publishedAt)} · {article.readingTime} min read
							</p>
						</div>
					</div>
					
					<h2 class="article-card-title">
						<a href="/article/{article.id}" class="hover:underline">
							{article.title}
						</a>
					</h2>
					
					<p class="article-card-excerpt">
						{article.excerpt}
					</p>
					
					<div class="flex items-center justify-between">
						<div class="flex flex-wrap gap-2">
							{#each article.tags.slice(0, 2) as tag}
								<a href="/topic/{tag.toLowerCase().replace(' ', '-')}" class="tag">
									{tag}
								</a>
							{/each}
						</div>
						
						<div class="flex items-center gap-4">
							<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="Save article">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
								</svg>
							</button>
							<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="More options">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
								</svg>
							</button>
						</div>
					</div>
				</article>
			{/each}
		</div>
			
			<!-- Load More -->
			<div class="text-center py-8">
				<button class="btn-secondary">
					Load more stories
				</button>
			</div>
		</div>

		<!-- Sidebar -->
		<aside class="space-y-8" data-mpulse-section="sidebar" data-content-type="sidebar-widgets">
			<!-- Trending -->
			<section>
				<h3 class="font-bold mb-4 flex items-center gap-2">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
					</svg>
					Trending on Solutions Edge
				</h3>
				<ol class="space-y-4">
					{#each trendingArticles as article}
						<li class="flex gap-3">
							<span class="text-2xl font-bold text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
								{article.number}
							</span>
							<div>
								<a href="/article/{article.id}" class="block">
									<h4 class="font-medium text-sm leading-tight mb-1 hover:underline">
										{article.title}
									</h4>
								</a>
								<p class="text-xs text-md-on-surface-variant">
									{article.author}
								</p>
							</div>
						</li>
					{/each}
				</ol>
			</section>

			<!-- Topics -->
			<section>
				<h3 class="font-bold mb-4">Recommended topics</h3>
				<div class="flex flex-wrap gap-2">
					{#each topics as topic}
						<a href="/topic/{getTopicSlug(topic)}" class="tag">
							{topic}
						</a>
					{/each}
				</div>
			</section>

			<!-- Newsletter -->
			<section class="bg-md-surface-variant dark:bg-md-dark-surface-variant p-6 rounded-lg">
				<h3 class="font-bold mb-2">Get the weekly digest</h3>
				<p class="text-sm text-md-on-surface-variant mb-4">
					The best of Solutions Edge, delivered to your inbox every week.
				</p>
				<form class="space-y-3">
					<input 
						type="email" 
						placeholder="Your email"
						class="w-full px-3 py-2 bg-md-surface dark:bg-md-dark-surface rounded border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary"
					/>
					<button type="submit" class="btn-primary w-full">
						Subscribe
					</button>
				</form>
			</section>

			<!-- Footer Links -->
			<nav class="text-sm space-y-2">
				<a href="/help" class="text-md-on-surface-variant hover:text-md-on-surface block">Help</a>
				<a href="/privacy" class="text-md-on-surface-variant hover:text-md-on-surface block">Privacy</a>
				<a href="/terms" class="text-md-on-surface-variant hover:text-md-on-surface block">Terms</a>
			</nav>
		</aside>
	</div>
</div>

<style>
	/* Add any component-specific styles here */
</style>