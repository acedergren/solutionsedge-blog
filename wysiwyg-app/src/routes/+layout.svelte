<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	let isAuthenticated = false;

	onMount(() => {
		// Check authentication state
		isAuthenticated = !!data.session;
	});
</script>

<div class="min-h-screen bg-surface flex flex-col">
	<header class="sticky top-0 z-50 bg-surface/95 backdrop-blur-lg border-b border-secondary-200 animate-slide-down">
		<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center">
					<h1 class="text-headline-medium font-medium text-secondary-900 tracking-tight">
						Solutions Edge Editor
					</h1>
				</div>
				
				<div class="flex items-center gap-4">
					<nav class="hidden md:flex items-center gap-6">
						<a 
							href="/" 
							class="nav-link {$page.url.pathname === '/' ? 'nav-link-active' : ''}"
						>
							Home
						</a>
						<a 
							href="/editor/new" 
							class="nav-link {$page.url.pathname.startsWith('/editor') ? 'nav-link-active' : ''}"
						>
							New Post
						</a>
						<a 
							href="/dashboard" 
							class="nav-link {$page.url.pathname === '/dashboard' ? 'nav-link-active' : ''}"
						>
							Dashboard
						</a>
						<a 
							href="/feed.xml" 
							class="nav-link"
							target="_blank"
						>
							RSS
						</a>
					</nav>
					
					{#if isAuthenticated}
						<span class="text-body-medium text-secondary-600 hidden sm:block">
							{data.session?.user?.email}
						</span>
						<form method="POST" action="/auth/signout">
							<button type="submit" class="btn-tertiary text-sm">
								Sign Out
							</button>
						</form>
					{:else}
						<a href="/auth/signin" class="btn-primary">
							Sign In
						</a>
					{/if}
				</div>
			</div>
		</nav>
	</header>

	<main class="flex-1 animate-fade-in">
		<slot />
	</main>

	<footer class="bg-surface-container-low border-t border-secondary-200 py-8 mt-16 animate-slide-up">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<p class="text-center text-body-small text-secondary-600">
				&copy; 2024 Solutions Edge Editor. Built with precision and purpose.
			</p>
		</div>
	</footer>
</div>