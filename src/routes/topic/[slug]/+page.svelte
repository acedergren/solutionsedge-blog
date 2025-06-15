<script lang="ts">
	import { page } from '$app/stores';
	import type { Article } from '$lib/types';

	// Map of topic data - in a real app this would come from a database
	const topicData: Record<string, { name: string; description: string }> = {
		'cloud-computing': {
			name: 'Cloud Computing',
			description: 'Infrastructure, platforms, and services delivered through the cloud'
		},
		'edge-computing': {
			name: 'Edge Computing',
			description: 'Processing data closer to where it\'s generated for faster insights'
		},
		'kubernetes': {
			name: 'Kubernetes',
			description: 'Container orchestration for deploying and managing applications'
		},
		'security': {
			name: 'Security',
			description: 'Protecting systems, networks, and data from digital attacks'
		},
		'zero-trust': {
			name: 'Zero Trust',
			description: 'Security model that requires verification for every connection'
		},
		'devops': {
			name: 'DevOps',
			description: 'Practices combining software development and IT operations'
		},
		'architecture': {
			name: 'Architecture',
			description: 'Designing and structuring complex software systems'
		},
		'serverless': {
			name: 'Serverless',
			description: 'Building applications without managing infrastructure'
		},
		'ai-ml': {
			name: 'AI/ML',
			description: 'Artificial intelligence and machine learning applications'
		},
		'networking': {
			name: 'Networking',
			description: 'Connecting and communicating between systems and devices'
		},
		'solutions-engineering': {
			name: 'Solutions Engineering',
			description: 'Bridging technical solutions with business requirements'
		},
		'best-practices': {
			name: 'Best Practices',
			description: 'Proven methods and techniques for optimal results'
		},
		'cloud-architecture': {
			name: 'Cloud Architecture',
			description: 'Designing scalable and reliable cloud systems'
		},
		'distributed-systems': {
			name: 'Distributed Systems',
			description: 'Building systems that work across multiple machines'
		},
		'iot': {
			name: 'IoT',
			description: 'Internet of Things - connecting devices to the internet'
		},
		'5g': {
			name: '5G',
			description: 'Fifth generation wireless technology for digital cellular networks'
		}
	};

	$: slug = $page.params.slug;
	$: currentTopic = topicData[slug] || { name: 'Unknown Topic', description: 'Topic not found' };

	function formatDate(date: Date): string {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	// Generate articles based on current topic
	function generateArticles(topicName: string): Article[] {
		return [
			{
				id: '1',
				title: `Getting Started with ${topicName}`,
				excerpt: `Learn the fundamentals of ${topicName} and how to apply them in real-world scenarios.`,
				content: '',
				author: {
					name: 'Alexander Cedergren',
					avatar: 'https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff',
					bio: 'Solutions Engineer'
				},
				publishedAt: new Date('2024-01-15'),
				readingTime: 8,
				tags: [topicName]
			},
			{
				id: '2',
				title: `Advanced ${topicName} Techniques`,
				excerpt: `Deep dive into advanced concepts and best practices for ${topicName}.`,
				content: '',
				author: {
					name: 'Alexander Cedergren',
					avatar: 'https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff',
					bio: 'Solutions Engineer'
				},
				publishedAt: new Date('2024-01-12'),
				readingTime: 12,
				tags: [topicName, 'Advanced']
			},
			{
				id: '3',
				title: `${topicName} Best Practices`,
				excerpt: `Essential best practices every developer should know about ${topicName}.`,
				content: '',
				author: {
					name: 'Guest Author',
					avatar: 'https://ui-avatars.com/api/?name=Guest+Author&background=2196f3&color=fff',
					bio: 'Industry Expert'
				},
				publishedAt: new Date('2024-01-10'),
				readingTime: 6,
				tags: [topicName, 'Best Practices']
			}
		];
	}

	$: articles = generateArticles(currentTopic.name);
</script>

<svelte:head>
	<title>{currentTopic.name} - The Solutions Edge</title>
	<meta name="description" content="{currentTopic.description}" />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Topic Header -->
	<header class="text-center mb-12">
		<h1 class="article-title mb-4">{currentTopic.name}</h1>
		<p class="article-subtitle text-md-on-surface-variant dark:text-md-dark-on-surface-variant max-w-2xl mx-auto">
			{currentTopic.description}
		</p>
		<div class="flex items-center justify-center gap-4 mt-6">
			<button class="btn-primary">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
				</svg>
				Follow
			</button>
			<span class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
				{articles.length} articles published
			</span>
		</div>
	</header>

	<!-- Articles -->
	<div class="grid lg:grid-cols-3 gap-8">
		<div class="lg:col-span-2 space-y-8">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-xl font-bold text-md-on-surface dark:text-md-dark-on-surface">Latest in {currentTopic.name}</h2>
				<select class="px-4 py-2 bg-md-surface-variant dark:bg-md-dark-surface-variant text-md-on-surface dark:text-md-dark-on-surface rounded-lg border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary">
					<option>Most Recent</option>
					<option>Most Popular</option>
					<option>Most Discussed</option>
				</select>
			</div>

			{#each articles as article}
				<article class="article-card group pb-8 border-b border-md-outline dark:border-md-dark-outline last:border-0">
					<div class="flex items-start gap-4 mb-3">
						<img 
							src={article.author.avatar} 
							alt={article.author.name}
							class="author-avatar"
						/>
						<div class="flex-1">
							<p class="author-name text-md-on-surface dark:text-md-dark-on-surface">{article.author.name}</p>
							<p class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
								{formatDate(article.publishedAt)} · {article.readingTime} min read
							</p>
						</div>
					</div>
					
					<h2 class="article-card-title text-md-on-surface dark:text-md-dark-on-surface">
						<a href="/article/{article.id}" class="hover:underline">
							{article.title}
						</a>
					</h2>
					
					<p class="article-card-excerpt text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						{article.excerpt}
					</p>
					
					<div class="flex items-center justify-between">
						<div class="flex flex-wrap gap-2">
							{#each article.tags as tag}
								<a href="/topic/{tag.toLowerCase().replace(' ', '-')}" class="tag">
									{tag}
								</a>
							{/each}
						</div>
						
						<div class="flex items-center gap-4">
							<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="Save article">
								<svg class="w-5 h-5 text-md-on-surface-variant dark:text-md-dark-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
								</svg>
							</button>
							<button class="p-2 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant rounded-full transition-colors" aria-label="More options">
								<svg class="w-5 h-5 text-md-on-surface-variant dark:text-md-dark-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
								</svg>
							</button>
						</div>
					</div>
				</article>
			{/each}

			<div class="text-center py-8">
				<button class="btn-secondary">
					Load more articles
				</button>
			</div>
		</div>

		<!-- Sidebar -->
		<aside class="space-y-8">
			<!-- Related Topics -->
			<section>
				<h3 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Related Topics</h3>
				<div class="flex flex-wrap gap-2">
					<a href="/topic/cloud-computing" class="tag">Cloud Computing</a>
					<a href="/topic/devops" class="tag">DevOps</a>
					<a href="/topic/kubernetes" class="tag">Kubernetes</a>
					<a href="/topic/security" class="tag">Security</a>
				</div>
			</section>

			<!-- Top Authors -->
			<section>
				<h3 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Top Authors in {currentTopic.name}</h3>
				<div class="space-y-4">
					<div class="flex items-center gap-3">
						<img 
							src="https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff" 
							alt="Alexander Cedergren"
							class="w-10 h-10 rounded-full"
						/>
						<div class="flex-1">
							<p class="font-medium text-sm text-md-on-surface dark:text-md-dark-on-surface">Alexander Cedergren</p>
							<p class="text-xs text-md-on-surface-variant dark:text-md-dark-on-surface-variant">12 articles</p>
						</div>
						<button class="btn-ghost text-xs">Follow</button>
					</div>
				</div>
			</section>

			<!-- Newsletter -->
			<section class="bg-md-surface-variant dark:bg-md-dark-surface-variant p-6 rounded-lg">
				<h3 class="font-bold mb-2 text-md-on-surface dark:text-md-dark-on-surface">Stay updated on {currentTopic.name}</h3>
				<p class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-4">
					Get the latest articles delivered to your inbox.
				</p>
				<form class="space-y-3">
					<input 
						type="email" 
						placeholder="Your email"
						class="w-full px-3 py-2 bg-md-surface dark:bg-md-dark-surface text-md-on-surface dark:text-md-dark-on-surface rounded border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary"
					/>
					<button type="submit" class="btn-primary w-full">
						Subscribe
					</button>
				</form>
			</section>
		</aside>
	</div>
</div>