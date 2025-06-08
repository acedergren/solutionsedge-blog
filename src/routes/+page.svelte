<script lang="ts">
	import type { Article, TrendingArticle } from '$lib/types';
	
	// Mock data - replace with actual data fetching
	const featuredArticle: Article = {
		id: '1',
		title: 'The Edge of Tomorrow: How Edge Computing is Reshaping Cloud Architecture',
		excerpt: 'As we push computing closer to where data is generated, we\'re not just improving latency—we\'re fundamentally reimagining how distributed systems work.',
		content: '',
		author: {
			name: 'Alexander Cedergren',
			avatar: 'https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff',
			bio: 'Solutions Engineer specializing in cloud and edge computing'
		},
		publishedAt: new Date('2024-01-15'),
		readingTime: 8,
		tags: ['Edge Computing', 'Cloud Architecture', 'Distributed Systems'],
		imageUrl: 'https://picsum.photos/800/400?random=1'
	};
	
	const articles: Article[] = [
		{
			id: '2',
			title: 'Securing the Perimeter: Zero Trust Architecture in Modern Applications',
			excerpt: 'Traditional security models are crumbling. Here\'s how Zero Trust principles can protect your distributed infrastructure.',
			content: '',
			author: {
				name: 'Alexander Cedergren',
				avatar: 'https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff',
				bio: 'Solutions Engineer'
			},
			publishedAt: new Date('2024-01-12'),
			readingTime: 6,
			tags: ['Security', 'Zero Trust', 'Architecture']
		},
		{
			id: '3',
			title: 'Kubernetes at the Edge: Challenges and Solutions',
			excerpt: 'Running Kubernetes in edge environments presents unique challenges. Learn from real-world deployments and best practices.',
			content: '',
			author: {
				name: 'Alexander Cedergren',
				avatar: 'https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff',
				bio: 'Solutions Engineer'
			},
			publishedAt: new Date('2024-01-10'),
			readingTime: 12,
			tags: ['Kubernetes', 'Edge Computing', 'DevOps']
		},
		{
			id: '4',
			title: 'The Art of Solution Design: Balancing Technical Excellence with Business Needs',
			excerpt: 'Great solutions aren\'t just technically sound—they solve real business problems. A framework for effective solution engineering.',
			content: '',
			author: {
				name: 'Alexander Cedergren',
				avatar: 'https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff',
				bio: 'Solutions Engineer'
			},
			publishedAt: new Date('2024-01-08'),
			readingTime: 10,
			tags: ['Solutions Engineering', 'Architecture', 'Best Practices']
		}
	];
	
	const trendingArticles: TrendingArticle[] = [
		{ number: '01', title: 'Understanding WebAssembly\'s Role in Edge Computing', author: 'Tech Weekly' },
		{ number: '02', title: 'The Rise of Platform Engineering', author: 'DevOps Digest' },
		{ number: '03', title: 'AI/ML Workloads at the Edge', author: 'AI Frontiers' },
		{ number: '04', title: 'Serverless vs Edge Functions', author: 'Cloud Native' },
		{ number: '05', title: 'The Future of CDN Technology', author: 'Network World' },
		{ number: '06', title: 'GitOps for Edge Deployments', author: 'Dev Practices' }
	];
	
	const topics = [
		'Cloud Computing', 'Edge Computing', 'Kubernetes', 'Security', 
		'DevOps', 'Architecture', 'Serverless', 'AI/ML', 'Networking'
	];
	
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
	<section class="py-8 lg:py-12 border-b border-md-outline dark:border-md-dark-outline">
		<div class="grid lg:grid-cols-2 gap-8 items-center">
			<div>
				<h1 class="article-title mb-4">{featuredArticle.title}</h1>
				<p class="article-subtitle text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
					{featuredArticle.excerpt}
				</p>
				<div class="flex items-center gap-4 mt-6">
					<img 
						src={featuredArticle.author.avatar} 
						alt={featuredArticle.author.name}
						class="author-avatar"
					/>
					<div>
						<p class="author-name">{featuredArticle.author.name}</p>
						<p class="text-sm text-md-on-surface-variant">
							{formatDate(featuredArticle.publishedAt)} · {featuredArticle.readingTime} min read
						</p>
					</div>
				</div>
			</div>
			<div class="aspect-[16/9] overflow-hidden rounded-lg">
				<img 
					src={featuredArticle.imageUrl} 
					alt={featuredArticle.title}
					class="w-full h-full object-cover"
				/>
			</div>
		</div>
	</section>

	<!-- Main Content Grid -->
	<div class="grid lg:grid-cols-3 gap-8 py-8">
		<!-- Articles List -->
		<div class="lg:col-span-2 space-y-8">
			{#each articles as article}
				<article class="article-card pb-8 border-b border-md-outline dark:border-md-dark-outline last:border-0">
					<div class="flex items-start gap-4 mb-3">
						<img 
							src={article.author.avatar} 
							alt={article.author.name}
							class="author-avatar"
						/>
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
								<span class="material-icons-outlined text-[20px]">bookmark_border</span>
							</button>
							<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="More options">
								<span class="material-icons-outlined text-[20px]">more_horiz</span>
							</button>
						</div>
					</div>
				</article>
			{/each}
			
			<!-- Load More -->
			<div class="text-center py-8">
				<button class="btn-secondary">
					Load more stories
				</button>
			</div>
		</div>

		<!-- Sidebar -->
		<aside class="space-y-8">
			<!-- Trending -->
			<section>
				<h3 class="font-bold mb-4 flex items-center gap-2">
					<span class="material-icons-outlined text-[20px]">trending_up</span>
					Trending on Solutions Edge
				</h3>
				<ol class="space-y-4">
					{#each trendingArticles as article}
						<li class="flex gap-3">
							<span class="text-2xl font-bold text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
								{article.number}
							</span>
							<div>
								<h4 class="font-medium text-sm leading-tight mb-1 hover:underline cursor-pointer">
									{article.title}
								</h4>
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
						<a href="/topic/{topic.toLowerCase().replace(' ', '-')}" class="tag">
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
				<a href="/status" class="text-md-on-surface-variant hover:text-md-on-surface block">Status</a>
				<a href="/writers" class="text-md-on-surface-variant hover:text-md-on-surface block">Writers</a>
				<a href="/blog" class="text-md-on-surface-variant hover:text-md-on-surface block">Blog</a>
				<a href="/careers" class="text-md-on-surface-variant hover:text-md-on-surface block">Careers</a>
				<a href="/privacy" class="text-md-on-surface-variant hover:text-md-on-surface block">Privacy</a>
				<a href="/terms" class="text-md-on-surface-variant hover:text-md-on-surface block">Terms</a>
			</nav>
		</aside>
	</div>
</div>

<style>
	/* Add any component-specific styles here */
</style>