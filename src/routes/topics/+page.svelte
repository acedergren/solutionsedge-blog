<script lang="ts">
	interface Topic {
		name: string;
		slug: string;
		description: string;
		articleCount: number;
		featured: boolean;
	}

	const topics: Topic[] = [
		{
			name: 'Cloud Computing',
			slug: 'cloud-computing',
			description: 'Infrastructure, platforms, and services delivered through the cloud',
			articleCount: 45,
			featured: true
		},
		{
			name: 'Edge Computing',
			slug: 'edge-computing',
			description: 'Processing data closer to where it\'s generated for faster insights',
			articleCount: 38,
			featured: true
		},
		{
			name: 'Kubernetes',
			slug: 'kubernetes',
			description: 'Container orchestration for deploying and managing applications',
			articleCount: 32,
			featured: true
		},
		{
			name: 'Security',
			slug: 'security',
			description: 'Protecting systems, networks, and data from digital attacks',
			articleCount: 28,
			featured: false
		},
		{
			name: 'DevOps',
			slug: 'devops',
			description: 'Practices combining software development and IT operations',
			articleCount: 25,
			featured: false
		},
		{
			name: 'Architecture',
			slug: 'architecture',
			description: 'Designing and structuring complex software systems',
			articleCount: 22,
			featured: false
		},
		{
			name: 'Serverless',
			slug: 'serverless',
			description: 'Building applications without managing infrastructure',
			articleCount: 18,
			featured: false
		},
		{
			name: 'AI/ML',
			slug: 'ai-ml',
			description: 'Artificial intelligence and machine learning applications',
			articleCount: 16,
			featured: false
		},
		{
			name: 'Networking',
			slug: 'networking',
			description: 'Connecting and communicating between systems and devices',
			articleCount: 14,
			featured: false
		},
		{
			name: 'Zero Trust',
			slug: 'zero-trust',
			description: 'Security model that requires verification for every connection',
			articleCount: 12,
			featured: false
		},
		{
			name: 'Solutions Engineering',
			slug: 'solutions-engineering',
			description: 'Bridging technical solutions with business requirements',
			articleCount: 10,
			featured: false
		},
		{
			name: 'Best Practices',
			slug: 'best-practices',
			description: 'Proven methods and techniques for optimal results',
			articleCount: 8,
			featured: false
		}
	];

	const featuredTopics = topics.filter(t => t.featured);
	const allTopics = topics.sort((a, b) => b.articleCount - a.articleCount);
</script>

<svelte:head>
	<title>Topics - The Solutions Edge</title>
	<meta name="description" content="Explore topics on cloud computing, edge technologies, security, and more." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="text-center mb-12">
		<h1 class="article-title mb-4">Explore Topics</h1>
		<p class="article-subtitle text-md-on-surface-variant dark:text-md-dark-on-surface-variant max-w-2xl mx-auto">
			Dive deep into the technologies and practices shaping modern infrastructure
		</p>
	</div>

	<!-- Featured Topics -->
	<section class="mb-12">
		<h2 class="text-2xl font-bold mb-6">Featured Topics</h2>
		<div class="grid md:grid-cols-3 gap-6">
			{#each featuredTopics as topic}
				<a href="/topic/{topic.slug}" class="block p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg hover:shadow-lg transition-all duration-200 group">
					<h3 class="text-xl font-bold mb-2 group-hover:text-md-primary transition-colors">
						{topic.name}
					</h3>
					<p class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-4">
						{topic.description}
					</p>
					<p class="text-sm font-medium text-md-primary">
						{topic.articleCount} articles →
					</p>
				</a>
			{/each}
		</div>
	</section>

	<!-- All Topics -->
	<section>
		<h2 class="text-2xl font-bold mb-6">All Topics</h2>
		<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each allTopics as topic}
				<a href="/topic/{topic.slug}" class="flex items-center justify-between p-4 rounded-lg hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors group">
					<div>
						<h3 class="font-medium group-hover:text-md-primary transition-colors">
							{topic.name}
						</h3>
						<p class="text-sm text-md-on-surface-variant">
							{topic.articleCount} articles
						</p>
					</div>
					<svg class="w-5 h-5 text-md-on-surface-variant group-hover:text-md-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
					</svg>
				</a>
			{/each}
		</div>
	</section>
</div>