<script lang="ts">
	import { onMount } from 'svelte';
	import { logger } from '$lib/logger';

	let mounted = false;

	onMount(() => {
		logger.info('Home page loaded');
		mounted = true;
	});
</script>

<div class="relative overflow-hidden">
	<!-- Hero Section -->
	<section class="relative py-24 lg:py-32">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center animate-slide-up">
				<h1 class="text-display-large font-medium text-secondary-900 mb-6 text-balance">
					Welcome to <span class="text-primary">Solutions Edge Editor</span>
				</h1>
				<p class="text-headline-small text-secondary-600 mb-12 max-w-3xl mx-auto text-balance">
					A powerful WYSIWYG editor crafted for technical writers and content creators who demand precision and elegance
				</p>
				
				<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
					<a href="/editor/new" class="btn-primary text-lg px-8 py-4 rounded-2xl shadow-elevation-2 hover:shadow-elevation-4 transform hover:-translate-y-0.5 transition-all duration-300 ease-spring">
						Start Writing
					</a>
					<a href="/editor/drafts" class="btn-secondary text-lg px-8 py-4 rounded-2xl">
						View Drafts
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-16 lg:py-24 bg-surface-container-lowest">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
				{#if mounted}
					<div class="card-interactive p-8 bg-surface animate-slide-up" style="animation-delay: 100ms">
						<div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 animate-spring-bounce">
							<span class="text-2xl">🚀</span>
						</div>
						<h3 class="text-headline-small font-medium text-secondary-900 mb-3">Fast & Reliable</h3>
						<p class="text-body-large text-secondary-600">
							Built with SvelteKit 5 for optimal performance and server-side rendering
						</p>
					</div>
					
					<div class="card-interactive p-8 bg-surface animate-slide-up" style="animation-delay: 200ms">
						<div class="w-12 h-12 bg-tertiary-100 rounded-xl flex items-center justify-center mb-4 animate-spring-bounce">
							<span class="text-2xl">🔒</span>
						</div>
						<h3 class="text-headline-small font-medium text-secondary-900 mb-3">Secure</h3>
						<p class="text-body-large text-secondary-600">
							Enterprise-grade authentication to protect your valuable content
						</p>
					</div>
					
					<div class="card-interactive p-8 bg-surface animate-slide-up" style="animation-delay: 300ms">
						<div class="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mb-4 animate-spring-bounce">
							<span class="text-2xl">💾</span>
						</div>
						<h3 class="text-headline-small font-medium text-secondary-900 mb-3">Cloud Storage</h3>
						<p class="text-body-large text-secondary-600">
							AWS S3 integration for reliable and scalable content storage
						</p>
					</div>
					
					<div class="card-interactive p-8 bg-surface animate-slide-up" style="animation-delay: 400ms">
						<div class="w-12 h-12 bg-error-100 rounded-xl flex items-center justify-center mb-4 animate-spring-bounce">
							<span class="text-2xl">📝</span>
						</div>
						<h3 class="text-headline-small font-medium text-secondary-900 mb-3">Markdown Support</h3>
						<p class="text-body-large text-secondary-600">
							Seamless conversion between rich text and markdown formats
						</p>
					</div>
				{/if}
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-16 lg:py-24 bg-gradient-to-br from-primary-50 to-primary-100">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
			<h2 class="text-display-small font-medium text-secondary-900 mb-6">
				Ready to elevate your content?
			</h2>
			<p class="text-headline-small text-secondary-700 mb-8">
				Join technical writers who trust Solutions Edge Editor for their documentation needs
			</p>
			<a href="/editor/new" class="btn-primary text-lg px-10 py-4 rounded-2xl shadow-elevation-3 hover:shadow-elevation-5 transform hover:-translate-y-1 transition-all duration-300 ease-spring">
				Get Started Now
			</a>
		</div>
	</section>
</div>
