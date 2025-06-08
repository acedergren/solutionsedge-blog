<script lang="ts">
	// Placeholder data for blog posts
	const featuredPosts = [
		{
			title: 'Getting Started with Edge Computing',
			excerpt: 'Learn the fundamentals of edge computing and how it\'s transforming the way we process data.',
			date: '2024-01-15',
			category: 'Edge Computing',
			readTime: '5 min read'
		},
		{
			title: 'Material Design 3 in Web Development',
			excerpt: 'Implementing Google\'s latest design system for modern web applications.',
			date: '2024-01-10',
			category: 'Design',
			readTime: '8 min read'
		},
		{
			title: 'Deploying to Linode Object Storage',
			excerpt: 'A comprehensive guide to hosting static sites on Linode\'s S3-compatible storage.',
			date: '2024-01-05',
			category: 'Cloud',
			readTime: '6 min read'
		}
	];

	const categories = [
		{ name: 'Cloud Computing', count: 12, icon: 'cloud' },
		{ name: 'Edge Computing', count: 8, icon: 'router' },
		{ name: 'Security', count: 15, icon: 'security' },
		{ name: 'Design', count: 6, icon: 'palette' }
	];
</script>

<svelte:head>
	<title>The Solutions Edge - Cloud & Edge Computing Blog</title>
	<meta name="description" content="Expert insights on cloud computing, edge technologies, and solutions engineering." />
</svelte:head>

<!-- Hero Section -->
<section class="md-surface-container-low">
	<div class="max-w-7xl mx-auto px-4 py-20">
		<div class="max-w-3xl">
			<h1 class="md-display-medium mb-6">
				Welcome to <span class="text-md-primary">The Solutions Edge</span>
			</h1>
			<p class="md-headline-small text-md-on-surface-variant mb-8">
				Exploring the intersection of cloud computing, edge technologies, and modern solutions engineering.
			</p>
			<div class="flex flex-wrap gap-3">
				<a href="/blog" class="md-button-filled">
					<span class="material-icons">explore</span>
					Explore Articles
				</a>
				<a href="/about" class="md-button-outlined">
					<span class="material-icons">info</span>
					Learn More
				</a>
			</div>
		</div>
	</div>
</section>

<!-- Featured Posts -->
<section class="py-16">
	<div class="max-w-7xl mx-auto px-4">
		<h2 class="md-headline-large mb-8">Featured Articles</h2>
		
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each featuredPosts as post}
				<article class="md-card-elevated group hover:elevation-3 cursor-pointer">
					<div class="flex items-center gap-2 mb-4">
						<span class="md-chip-elevated">
							{post.category}
						</span>
						<span class="md-label-medium text-md-on-surface-variant">
							{post.readTime}
						</span>
					</div>
					
					<h3 class="md-headline-small mb-3 group-hover:text-md-primary transition-colors">
						{post.title}
					</h3>
					
					<p class="md-body-large text-md-on-surface-variant mb-4">
						{post.excerpt}
					</p>
					
					<time class="md-label-medium text-md-on-surface-variant">
						{new Date(post.date).toLocaleDateString('en-US', { 
							month: 'long', 
							day: 'numeric', 
							year: 'numeric' 
						})}
					</time>
				</article>
			{/each}
		</div>
	</div>
</section>

<!-- Categories -->
<section class="py-16 md-surface-container-low">
	<div class="max-w-7xl mx-auto px-4">
		<h2 class="md-headline-large mb-8">Browse by Category</h2>
		
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{#each categories as category}
				<a href="/category/{category.name.toLowerCase().replace(' ', '-')}" 
					class="md-card hover:elevation-2 flex items-center gap-4 group cursor-pointer">
					<div class="w-12 h-12 rounded-full bg-md-primary-container flex items-center justify-center">
						<span class="material-icons text-md-on-primary-container">{category.icon}</span>
					</div>
					<div class="flex-1">
						<h3 class="md-title-medium group-hover:text-md-primary transition-colors">
							{category.name}
						</h3>
						<p class="md-label-medium text-md-on-surface-variant">
							{category.count} articles
						</p>
					</div>
					<span class="material-icons text-md-on-surface-variant group-hover:text-md-primary transition-colors">
						arrow_forward
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- Newsletter CTA -->
<section class="py-16">
	<div class="max-w-7xl mx-auto px-4">
		<div class="md-surface-container-high rounded-2xl p-8 md:p-12 text-center">
			<span class="material-icons text-5xl text-md-primary mb-4">
				mail_outline
			</span>
			<h2 class="md-headline-medium mb-4">Stay Updated</h2>
			<p class="md-body-large text-md-on-surface-variant mb-8 max-w-2xl mx-auto">
				Get the latest insights on cloud computing and edge technologies delivered to your inbox.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
				<input 
					type="email" 
					placeholder="Enter your email"
					class="flex-1 px-4 py-3 rounded-full bg-md-surface-container text-md-on-surface 
						border border-md-outline-variant focus:border-md-primary focus:outline-none"
				/>
				<button class="md-button-filled">
					Subscribe
				</button>
			</div>
		</div>
	</div>
</section>