<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>About - The Solutions Edge</title>
	<meta name="description" content="Tech enthusiast sharing thoughts on cloud computing, edge technologies, and modern infrastructure solutions." />
</svelte:head>

<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Hero Section -->
	<header class="text-center mb-12">
		<h1 class="article-title mb-4">Hi, I'm Alexander</h1>
		<p class="article-subtitle text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
			Tech enthusiast who likes to tinker with things
		</p>
	</header>

	<!-- Content -->
	<div class="article-body space-y-8">
		<section>
			<h2 class="text-2xl font-bold mb-4">About Me</h2>
			<div class="prose dark:prose-invert max-w-none">
				<p>
					I'm a tech enthusiast with a passion for exploring the intersection of cloud computing, 
					edge technologies, and modern infrastructure. I love tinkering with new technologies, 
					building things, and figuring out how to make complex systems work better.
				</p>
				<p>
					This blog is my digital playground where I share my experiments, discoveries, and thoughts 
					about technology. Whether it's deploying applications at the edge, optimizing cloud architectures, 
					or exploring the latest DevOps tools, I enjoy diving deep into technical challenges and 
					sharing what I learn along the way.
				</p>
			</div>
		</section>

		<section>
			<h2 class="text-2xl font-bold mb-4">What I Tinker With</h2>
			<div class="grid md:grid-cols-2 gap-6 my-6">
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">Cloud & Edge Computing</h3>
					<p class="text-sm text-md-on-surface-variant">
						Building and breaking things in the cloud, exploring edge deployments, and everything in between.
					</p>
				</div>
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">Infrastructure & Architecture</h3>
					<p class="text-sm text-md-on-surface-variant">
						Designing systems that scale, fail gracefully, and don't keep me up at night.
					</p>
				</div>
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">DevOps & Automation</h3>
					<p class="text-sm text-md-on-surface-variant">
						If it can be automated, I'll find a way. If it can't, I'll probably try anyway.
					</p>
				</div>
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">Random Tech Experiments</h3>
					<p class="text-sm text-md-on-surface-variant">
						Sometimes the best discoveries come from "I wonder what happens if..."
					</p>
				</div>
			</div>
		</section>

		<!-- Important Disclaimer -->
		<section class="bg-md-error-container dark:bg-md-dark-error-container p-6 rounded-lg border border-md-error dark:border-md-dark-error">
			<h2 class="text-xl font-bold mb-3 text-md-on-error-container dark:text-md-dark-on-error-container">
				Important Disclaimer
			</h2>
			<div class="text-sm text-md-on-error-container dark:text-md-dark-on-error-container space-y-2">
				<p>
					<strong>All views, opinions, and content expressed on this blog are solely my own personal views and opinions.</strong>
				</p>
				<p>
					The content published on The Solutions Edge represents my individual thoughts, experiences, and technical explorations. 
					These views are mine alone and do not reflect, represent, or imply the views, positions, strategies, or opinions of 
					my employer, any organizations I may be affiliated with, or any clients I may work with, either directly or indirectly.
				</p>
				<p>
					Any technical implementations, code examples, architectural decisions, or recommendations shared here are based on my 
					personal experience and should not be construed as professional advice or official guidance from any organization.
				</p>
				<p>
					All product names, logos, brands, and trademarks mentioned are the property of their respective owners. Any reference 
					to specific commercial products, processes, or services by trade name, trademark, manufacturer, or otherwise does not 
					constitute or imply endorsement, recommendation, or favoring by me or any organization I'm associated with.
				</p>
				<p>
					<strong>Use any information, code, or advice from this blog at your own risk.</strong> Always conduct your own research 
					and testing appropriate to your specific use case and requirements.
				</p>
			</div>
		</section>

		<section>
			<h2 class="text-2xl font-bold mb-4">Connect</h2>
			<p class="mb-4">
				Want to chat about tech, share ideas, or collaborate on something interesting? Feel free to reach out!
			</p>
			<div class="flex gap-4">
				<a href="/contact" class="btn-primary">
					Get in Touch
				</a>
				<a href="https://github.com/acedergren" target="_blank" rel="noopener" class="btn-secondary">
					GitHub
				</a>
				<a href="https://www.linkedin.com/in/acedergr/" target="_blank" rel="noopener" class="btn-secondary">
					LinkedIn
				</a>
			</div>
		</section>
	</div>
</article>

<style>
	.btn-primary {
		@apply inline-flex items-center px-4 py-2 bg-md-primary text-md-on-primary rounded-lg 
			   hover:bg-blue-600 transition-colors font-medium;
	}
	
	.btn-secondary {
		@apply inline-flex items-center px-4 py-2 border border-md-outline dark:border-md-dark-outline 
			   rounded-lg hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant 
			   transition-colors font-medium;
	}
</style>