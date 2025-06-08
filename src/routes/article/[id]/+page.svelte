<script lang="ts">
	import type { Article } from '$lib/types';
	
	// Mock article data - replace with actual data fetching
	const article: Article = {
		id: '1',
		title: 'The Edge of Tomorrow: How Edge Computing is Reshaping Cloud Architecture',
		excerpt: 'As we push computing closer to where data is generated, we\'re not just improving latency—we\'re fundamentally reimagining how distributed systems work.',
		content: `
			<p>The landscape of cloud computing is undergoing a fundamental transformation. As we generate more data at the edge of our networks—from IoT devices, autonomous vehicles, and smart cities—the traditional centralized cloud model is showing its limitations. Enter edge computing: a paradigm that brings computation and data storage closer to the sources of data.</p>

			<h2>The Latency Problem</h2>
			<p>When milliseconds matter, the speed of light becomes your enemy. A round trip from San Francisco to a data center in Virginia takes approximately 60 milliseconds under ideal conditions. For autonomous vehicles making split-second decisions, or augmented reality applications requiring real-time responses, this latency is unacceptable.</p>

			<p>Edge computing solves this by processing data where it's generated. Instead of sending all data to distant cloud servers, edge nodes handle time-sensitive operations locally, only forwarding what's necessary to the cloud for deeper analysis or long-term storage.</p>

			<blockquote>
				"The edge isn't replacing the cloud—it's extending it. We're creating a continuum of compute that spans from centralized data centers to the furthest reaches of our networks."
			</blockquote>

			<h2>Architecture Patterns for the Edge</h2>
			<p>Building for the edge requires rethinking traditional cloud architectures. Here are three patterns that have emerged as best practices:</p>

			<h3>1. Hierarchical Processing</h3>
			<p>Data flows through multiple tiers, with each layer handling different aspects of processing. Edge devices perform initial filtering and real-time responses, regional nodes aggregate and analyze patterns, and cloud data centers handle machine learning model training and historical analysis.</p>

			<h3>2. Federated Learning</h3>
			<p>Instead of centralizing all data for ML training, models are trained locally on edge devices and only model updates are shared. This preserves privacy while still benefiting from collective learning.</p>

			<h3>3. Event-Driven Architectures</h3>
			<p>Edge systems must be reactive and efficient. Event-driven patterns allow edge nodes to process data streams in real-time, triggering actions only when specific conditions are met.</p>

			<h2>Challenges and Solutions</h2>
			<p>Edge computing isn't without its challenges. Resource constraints, network reliability, and security concerns all require careful consideration.</p>

			<p><strong>Resource Constraints:</strong> Edge devices often have limited CPU, memory, and storage. Solutions include lightweight containerization (think K3s instead of full Kubernetes), efficient data structures, and intelligent caching strategies.</p>

			<p><strong>Network Reliability:</strong> Edge nodes must function even when disconnected from the cloud. This requires robust offline-first architectures with eventual consistency models and conflict resolution strategies.</p>

			<p><strong>Security:</strong> With compute distributed across potentially thousands of nodes, the attack surface expands dramatically. Zero-trust architectures, hardware-based security modules, and automated security updates become critical.</p>

			<h2>The Future is Distributed</h2>
			<p>As 5G networks roll out and IoT devices proliferate, edge computing will become not just useful, but essential. We're moving toward a world where intelligence is embedded everywhere—from traffic lights to factory floors to retail stores.</p>

			<p>The organizations that thrive will be those that can effectively orchestrate this distributed intelligence, creating seamless experiences that leverage the best of both edge and cloud computing. The future isn't about choosing between edge and cloud—it's about using both in harmony to create systems that are responsive, resilient, and intelligent.</p>

			<p>Welcome to the edge. The future of computing is already here—it's just more evenly distributed.</p>
		`,
		author: {
			name: 'Alexander Cedergren',
			avatar: 'https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff',
			bio: 'Solutions Engineer specializing in cloud and edge computing. Building distributed systems that scale.'
		},
		publishedAt: new Date('2024-01-15'),
		readingTime: 8,
		tags: ['Edge Computing', 'Cloud Architecture', 'Distributed Systems', 'IoT', '5G'],
		imageUrl: 'https://picsum.photos/1200/600?random=1'
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
					<a href="/topic/{tag.toLowerCase().replace(' ', '-')}" class="tag">
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