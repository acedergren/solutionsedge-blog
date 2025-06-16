<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	
	export let data: PageData;
	
	// Convert markdown to HTML
	const articleHtml = marked(data.article.content);
	
	const article = {
		...data.article,
		content: articleHtml,
		author: {
			name: data.article.author?.name || data.article.author,
			avatar: data.article.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.article.author?.name || data.article.author)}&background=1a8917&color=fff`,
			bio: data.article.author?.bio || 'Solutions Engineer specializing in cloud and edge computing. Building distributed systems that scale.'
		},
		publishedAt: new Date(data.article.publishedAt || data.article.date),
		readingTime: data.article.readingTime || Math.ceil(data.article.content.split(' ').length / 200),
		imageUrl: data.article.imageUrl || `https://picsum.photos/1200/600?random=${data.article.id}`
	};
	
	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	}
	
	let isFollowing = false;
	let hasClapped = false;
	let clapCount = 142;
</script>

<svelte:head>
	<title>{article.title} - The Solutions Edge</title>
	<meta name="description" content={article.excerpt} />
</svelte:head>

<article class="min-h-screen">
	<!-- Hero Image -->
	{#if article.imageUrl}
		<div class="w-full h-[40vh] md:h-[60vh] relative">
			<img 
				src={article.imageUrl} 
				alt={article.title}
				class="w-full h-full object-cover"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
		</div>
	{/if}
	
	<!-- Article Content -->
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
		<div class="bg-md-surface dark:bg-md-dark-surface rounded-t-lg">
			<!-- Title Section -->
			<header class="pt-12 pb-8">
				<h1 class="article-title mb-4">{article.title}</h1>
				<p class="article-subtitle text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
					{article.excerpt}
				</p>
				
				<!-- Author Info -->
				<div class="flex items-center justify-between mt-8">
					<div class="flex items-center gap-4">
						<img 
							src={article.author.avatar} 
							alt={article.author.name}
							class="w-12 h-12 rounded-full"
						/>
						<div>
							<div class="flex items-center gap-3">
								<p class="font-medium">{article.author.name}</p>
								<button 
									class="text-sm {isFollowing ? 'text-md-on-surface-variant' : 'text-md-primary'}"
									on:click={() => isFollowing = !isFollowing}
								>
									{isFollowing ? 'Following' : 'Follow'}
								</button>
							</div>
							<p class="text-sm text-md-on-surface-variant">
								{formatDate(article.publishedAt)} · {article.readingTime} min read
							</p>
						</div>
					</div>
					
					<!-- Share Actions -->
					<div class="flex items-center gap-2">
						<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="Share on Twitter">
							<span class="material-icons-outlined text-[20px]">share</span>
						</button>
						<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="Save article">
							<span class="material-icons-outlined text-[20px]">bookmark_border</span>
						</button>
						<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="More options">
							<span class="material-icons-outlined text-[20px]">more_horiz</span>
						</button>
					</div>
				</div>
			</header>
			
			<!-- Article Body -->
			<div class="article-body pb-12">
				{@html article.content}
			</div>
			
			<!-- Tags -->
			<div class="flex flex-wrap gap-2 pb-8">
				{#each article.tags as tag}
					<a href="/topic/{tag.toLowerCase().replace(/\s+/g, '-')}" class="tag">
						{tag}
					</a>
				{/each}
			</div>
			
			<!-- Engagement Section -->
			<div class="border-t border-md-outline dark:border-md-dark-outline py-8">
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-6">
						<button 
							class="flex items-center gap-2 {hasClapped ? 'text-md-primary' : ''}"
							on:click={() => { hasClapped = !hasClapped; if (hasClapped) clapCount++; else clapCount--; }}
						>
							<span class="material-icons-outlined text-[24px]">
								{hasClapped ? 'favorite' : 'favorite_border'}
							</span>
							<span class="text-sm font-medium">{clapCount}</span>
						</button>
						<button class="flex items-center gap-2">
							<span class="material-icons-outlined text-[24px]">chat_bubble_outline</span>
							<span class="text-sm font-medium">23</span>
						</button>
					</div>
					
					<div class="flex items-center gap-2">
						<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="Share">
							<span class="material-icons-outlined text-[20px]">share</span>
						</button>
						<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="Save">
							<span class="material-icons-outlined text-[20px]">bookmark_border</span>
						</button>
					</div>
				</div>
			</div>
			
			<!-- Author Bio -->
			<div class="border-t border-md-outline dark:border-md-dark-outline py-8">
				<div class="flex items-start gap-4">
					<img 
						src={article.author.avatar} 
						alt={article.author.name}
						class="w-16 h-16 rounded-full"
					/>
					<div class="flex-1">
						<h3 class="font-bold text-lg mb-2">{article.author.name}</h3>
						<p class="text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-4">
							{article.author.bio}
						</p>
						<button class="btn-primary">
							Follow
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- More from Author -->
	<section class="bg-md-surface-variant dark:bg-md-dark-surface-variant py-12 mt-12">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			<h3 class="font-bold text-lg mb-6">More from {article.author.name}</h3>
			<!-- Add related articles here -->
		</div>
	</section>
</article>

<style>
	/* Ensure proper styling for article content */
	:global(.article-body h2) {
		@apply font-sans text-2xl md:text-3xl font-bold mt-12 mb-4;
	}
	
	:global(.article-body h3) {
		@apply font-sans text-xl md:text-2xl font-bold mt-8 mb-3;
	}
	
	:global(.article-body p) {
		@apply mb-6;
	}
	
	:global(.article-body blockquote) {
		@apply pl-4 border-l-4 border-md-primary italic my-8 text-lg;
	}
	
	:global(.article-body strong) {
		@apply font-semibold;
	}
</style>