<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>About - The Solutions Edge</title>
	<meta name="description" content="Learn about The Solutions Edge and our mission to share knowledge about cloud and edge computing." />
</svelte:head>

<article class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Hero Section -->
	<header class="text-center mb-12">
		<h1 class="article-title mb-4">About The Solutions Edge</h1>
		<p class="article-subtitle text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
			Where cloud meets edge, and solutions meet challenges
		</p>
	</header>

	<!-- Content -->
	<div class="article-body space-y-8">
		<section>
			<h2 class="text-2xl font-bold mb-4">Our Mission</h2>
			<p>
				The Solutions Edge is a technical blog dedicated to exploring the intersection of cloud computing, 
				edge technologies, and modern infrastructure. We believe in sharing practical knowledge and real-world 
				experiences to help engineers and architects build better solutions.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-bold mb-4">What We Cover</h2>
			<div class="grid md:grid-cols-2 gap-6 my-6">
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">Cloud & Edge Computing</h3>
					<p class="text-sm text-md-on-surface-variant">
						From traditional cloud architectures to cutting-edge edge deployments, we explore how to build 
						distributed systems that scale.
					</p>
				</div>
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">Security & Architecture</h3>
					<p class="text-sm text-md-on-surface-variant">
						Best practices for securing modern applications and designing resilient architectures that 
						stand the test of time.
					</p>
				</div>
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">DevOps & Automation</h3>
					<p class="text-sm text-md-on-surface-variant">
						Streamlining development and operations with modern tools, practices, and automation strategies.
					</p>
				</div>
				<div class="p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
					<h3 class="font-bold mb-2">Solutions Engineering</h3>
					<p class="text-sm text-md-on-surface-variant">
						Bridging the gap between technical capabilities and business needs to deliver value-driven solutions.
					</p>
				</div>
			</div>
		</section>

		<section>
			<h2 class="text-2xl font-bold mb-4">The Author</h2>
			<div class="flex items-start gap-6 p-6 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg">
				<img 
					src="https://ui-avatars.com/api/?name=Alexander+Cedergren&background=1a8917&color=fff&size=120" 
					alt="Alexander Cedergren"
					class="w-20 h-20 rounded-full"
				/>
				<div>
					<h3 class="font-bold text-lg mb-2">Alexander Cedergren</h3>
					<p class="text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-4">
						Solutions Engineer specializing in cloud and edge computing
					</p>
					<p class="text-sm">
						With years of experience in designing and implementing distributed systems, I'm passionate about 
						sharing knowledge and helping others navigate the complexities of modern infrastructure. When I'm 
						not architecting solutions, you'll find me exploring new technologies and contributing to the 
						tech community.
					</p>
				</div>
			</div>
		</section>

		<section>
			<h2 class="text-2xl font-bold mb-4">Get In Touch</h2>
			<p>
				Have questions, suggestions, or want to contribute? We'd love to hear from you!
			</p>
			<div class="flex gap-4 mt-4">
				<a href="/contact" class="btn-primary">
					Contact Us
				</a>
			</div>
		</section>
	</div>
</article>