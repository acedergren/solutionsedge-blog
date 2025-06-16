<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Help - The Solutions Edge</title>
	<meta name="description" content="Get help with using The Solutions Edge blog and find answers to common questions." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
	<h1 class="md-display-small mb-8">Help Center</h1>
	
	<div class="space-y-12">
		<!-- Navigation -->
		<section>
			<h2 class="md-headline-medium mb-4">Navigating the Site</h2>
			<div class="space-y-4">
				<div class="md-card p-6">
					<h3 class="md-title-large mb-2">Finding Articles</h3>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						Browse articles on the home page, explore by topic, or use the search feature in the navigation bar. Articles are organized by publication date and topic tags.
					</p>
				</div>
				
				<div class="md-card p-6">
					<h3 class="md-title-large mb-2">Topics</h3>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						Click on any topic tag to see all related articles. Popular topics include Cloud Computing, Edge Computing, Kubernetes, and Web Performance.
					</p>
				</div>
			</div>
		</section>
		
		<!-- Reading Experience -->
		<section>
			<h2 class="md-headline-medium mb-4">Reading Experience</h2>
			<div class="space-y-4">
				<div class="md-card p-6">
					<h3 class="md-title-large mb-2">Dark Mode</h3>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						Toggle between light and dark themes using the moon/sun icon in the navigation bar. Your preference is saved automatically.
					</p>
				</div>
				
				<div class="md-card p-6">
					<h3 class="md-title-large mb-2">Code Examples</h3>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						Code snippets in articles are syntax-highlighted for readability. Many examples include comments explaining key concepts.
					</p>
				</div>
			</div>
		</section>
		
		<!-- Content -->
		<section>
			<h2 class="md-headline-medium mb-4">About Our Content</h2>
			<div class="space-y-4">
				<div class="md-card p-6">
					<h3 class="md-title-large mb-2">Technical Depth</h3>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						Articles range from introductory concepts to deep technical implementations. Each article shows an estimated reading time to help you plan.
					</p>
				</div>
				
				<div class="md-card p-6">
					<h3 class="md-title-large mb-2">Real-World Focus</h3>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						Content is based on actual enterprise implementations and production experiences, not just theoretical concepts.
					</p>
				</div>
			</div>
		</section>
		
		<!-- Contact -->
		<section>
			<h2 class="md-headline-medium mb-4">Need More Help?</h2>
			<div class="md-card p-6">
				<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-4">
					Can't find what you're looking for? Have suggestions for improvement?
				</p>
				<div class="flex gap-4">
					<a href="/contact" class="md-button-filled">
						Contact Us
					</a>
					<a href="/about" class="md-button-outlined">
						Learn More About Us
					</a>
				</div>
			</div>
		</section>
		
		<!-- FAQ -->
		<section>
			<h2 class="md-headline-medium mb-4">Frequently Asked Questions</h2>
			<div class="space-y-4">
				<details class="md-card p-6">
					<summary class="md-title-large cursor-pointer">How often is new content published?</summary>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant mt-4">
						New articles are published regularly, typically 2-3 times per week. Subscribe to our newsletter to get notified of new content.
					</p>
				</details>
				
				<details class="md-card p-6">
					<summary class="md-title-large cursor-pointer">Can I contribute articles?</summary>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant mt-4">
						We're currently not accepting guest contributions, but this may change in the future. Follow us for updates.
					</p>
				</details>
				
				<details class="md-card p-6">
					<summary class="md-title-large cursor-pointer">Are the code examples production-ready?</summary>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant mt-4">
						While our examples are based on production implementations, always review and test thoroughly before using in your environment. Consider your specific requirements and security needs.
					</p>
				</details>
				
				<details class="md-card p-6">
					<summary class="md-title-large cursor-pointer">How can I stay updated?</summary>
					<p class="md-body-large text-md-on-surface-variant dark:text-md-dark-on-surface-variant mt-4">
						Subscribe to our weekly newsletter for curated content, or follow our RSS feed for real-time updates.
					</p>
				</details>
			</div>
		</section>
	</div>
</div>

<style>
	details summary::-webkit-details-marker {
		display: none;
	}
	
	details[open] summary {
		margin-bottom: 0.5rem;
	}
</style>