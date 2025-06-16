<script>
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Page Not Found - The Solutions Edge</title>
	<meta name="description" content="The page you're looking for doesn't exist." />
</svelte:head>

<div class="min-h-[70vh] flex items-center justify-center px-4">
	<div class="text-center max-w-2xl mx-auto">
		<h1 class="text-6xl font-bold mb-4 text-md-primary dark:text-md-dark-primary">404</h1>
		<h2 class="text-2xl font-bold mb-4">Page Not Found</h2>
		<p class="text-lg text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-8">
			Sorry, the page you're looking for doesn't exist or has been moved.
		</p>
		<p class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant mb-8">
			Requested URL: {$page.url.pathname}
		</p>
		<div class="flex gap-4 justify-center">
			<a href="/" class="btn-primary">
				Go Home
			</a>
			<a href="/topics" class="btn-secondary">
				Browse Topics
			</a>
		</div>
	</div>
</div>