<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let isDarkMode = false;
	let isScrolled = false;
	let showSearch = false;
	let mounted = false;
	
	$: if (browser && mounted) {
		updateTheme();
	}
	
	onMount(() => {
		mounted = true;
		// Check for saved theme preference or default to system preference
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme) {
			isDarkMode = savedTheme === 'dark';
		} else {
			isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
		}
		updateTheme();
		
		// Handle scroll
		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll);
		
		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleSystemThemeChange = (e: MediaQueryListEvent) => {
			if (!localStorage.getItem('theme')) {
				isDarkMode = e.matches;
				updateTheme();
			}
		};
		mediaQuery.addEventListener('change', handleSystemThemeChange);
		
		return () => {
			window.removeEventListener('scroll', handleScroll);
			mediaQuery.removeEventListener('change', handleSystemThemeChange);
		};
	});
	
	function updateTheme() {
		if (browser) {
			const root = document.documentElement;
			if (isDarkMode) {
				root.classList.add('dark');
				root.style.colorScheme = 'dark';
				localStorage.setItem('theme', 'dark');
			} else {
				root.classList.remove('dark');
				root.style.colorScheme = 'light';
				localStorage.setItem('theme', 'light');
			}
		}
	}
	
	function toggleTheme() {
		isDarkMode = !isDarkMode;
	}
	
	// Simple search functionality
	let searchQuery = '';
	let searchResults: Array<{title: string, url: string}> = [];
	
	function handleSearch() {
		if (searchQuery.trim()) {
			// For now, search through predefined content
			const allContent = [
				{ title: 'Understanding WebAssembly\'s Role in Edge Computing', url: '/article/1' },
				{ title: 'The Rise of Platform Engineering', url: '/article/2' },
				{ title: 'AI/ML Workloads at the Edge', url: '/article/3' },
				{ title: 'Serverless vs Edge Functions', url: '/article/4' },
				{ title: 'The Future of CDN Technology', url: '/article/5' },
				{ title: 'GitOps for Edge Deployments', url: '/article/6' },
				{ title: 'Cloud Computing', url: '/topic/cloud-computing' },
				{ title: 'Edge Computing', url: '/topic/edge-computing' },
				{ title: 'Kubernetes', url: '/topic/kubernetes' },
				{ title: 'Security', url: '/topic/security' }
			];
			
			searchResults = allContent.filter(item => 
				item.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
		} else {
			searchResults = [];
		}
	}
	
	function closeSearch() {
		showSearch = false;
		searchQuery = '';
		searchResults = [];
	}
</script>

<svelte:head>
	<!-- Prevent flash of incorrect theme -->
	<script>
		// This runs before Svelte hydration
		(function() {
			const theme = localStorage.getItem('theme');
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			const isDark = theme === 'dark' || (!theme && prefersDark);
			
			if (isDark) {
				document.documentElement.classList.add('dark');
				document.documentElement.style.colorScheme = 'dark';
			} else {
				document.documentElement.classList.remove('dark');
				document.documentElement.style.colorScheme = 'light';
			}
		})();
	</script>
</svelte:head>

<div class="min-h-screen bg-md-surface dark:bg-md-dark-surface text-md-on-surface dark:text-md-dark-on-surface transition-colors duration-200">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-md-surface dark:bg-md-dark-surface border-b {isScrolled ? 'border-md-outline dark:border-md-dark-outline shadow-sm' : 'border-transparent'} transition-all duration-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16 md:h-20">
				<!-- Logo and Desktop Nav -->
				<div class="flex items-center gap-8 lg:gap-12">
					<a href="/" class="flex items-center gap-3">
						<svg class="w-8 h-8" viewBox="0 0 48 48" fill="none">
							<rect width="48" height="48" rx="24" fill="currentColor" class="text-md-primary"/>
							<text x="50%" y="50%" font-family="sans-serif" font-size="20" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">SE</text>
						</svg>
						<span class="text-xl font-bold hidden sm:inline">The Solutions Edge</span>
					</a>
					
					<!-- Desktop Nav -->
					<nav class="hidden md:flex items-center gap-1">
						<a href="/" class="nav-link px-4 py-2 {$page.url.pathname === '/' ? 'nav-link-active' : ''}">
							Home
						</a>
						<a href="/about" class="nav-link px-4 py-2 {$page.url.pathname === '/about' ? 'nav-link-active' : ''}">
							About
						</a>
						<a href="/topics" class="nav-link px-4 py-2 {$page.url.pathname === '/topics' ? 'nav-link-active' : ''}">
							Topics
						</a>
					</nav>
				</div>

				<!-- Right side -->
				<div class="flex items-center gap-2">
					<!-- Search -->
					<button 
						class="p-2 rounded-full hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors"
						on:click={() => showSearch = !showSearch}
						aria-label="Search"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>
					
					<!-- Theme Toggle -->
					{#if mounted}
						<button 
							class="p-2 rounded-full hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors"
							on:click={toggleTheme}
							aria-label="Toggle theme"
						>
							{#if isDarkMode}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							{:else}
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
							{/if}
						</button>
					{/if}
					
					<!-- Mobile menu button -->
					<button class="md:hidden p-2 rounded-full hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors" aria-label="Menu">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
				</div>
			</div>
		</div>
		
		<!-- Search Bar -->
		{#if showSearch}
			<div class="border-t border-md-outline dark:border-md-dark-outline bg-md-surface dark:bg-md-dark-surface">
				<div class="max-w-3xl mx-auto px-4 py-4">
					<div class="relative">
						<input 
							type="search" 
							bind:value={searchQuery}
							on:input={handleSearch}
							placeholder="Search stories, topics, and authors"
							class="w-full px-4 py-2 pl-10 pr-10 bg-md-surface-variant dark:bg-md-dark-surface-variant text-md-on-surface dark:text-md-dark-on-surface placeholder-md-on-surface-variant dark:placeholder-md-dark-on-surface-variant rounded-full focus:outline-none focus:ring-2 focus:ring-md-primary"
						/>
						<svg class="w-5 h-5 absolute left-3 top-2.5 text-md-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<button 
							on:click={closeSearch}
							class="absolute right-3 top-2.5 text-md-on-surface-variant hover:text-md-on-surface"
							aria-label="Close search"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					
					<!-- Search Results -->
					{#if searchResults.length > 0}
						<div class="mt-4 bg-md-surface dark:bg-md-dark-surface rounded-lg shadow-lg border border-md-outline dark:border-md-dark-outline max-h-96 overflow-y-auto">
							{#each searchResults as result}
								<a 
									href={result.url} 
									class="block px-4 py-3 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors border-b border-md-outline dark:border-md-dark-outline last:border-0"
									on:click={closeSearch}
								>
									<p class="font-medium text-md-on-surface dark:text-md-dark-on-surface">{result.title}</p>
								</a>
							{/each}
						</div>
					{:else if searchQuery.trim()}
						<div class="mt-4 text-center text-md-on-surface-variant dark:text-md-dark-on-surface-variant py-4">
							No results found for "{searchQuery}"
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</nav>

	<!-- Main Content -->
	<main>
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-md-surface-variant dark:bg-md-dark-surface-variant border-t border-md-outline dark:border-md-dark-outline mt-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Discover</h4>
					<ul class="space-y-2">
						<li><a href="/topics" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">Topics</a></li>
						<li><a href="/about" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">About</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Resources</h4>
					<ul class="space-y-2">
						<li><a href="/help" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">Help</a></li>
						<li><a href="/contact" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">Contact</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Connect</h4>
					<ul class="space-y-2">
						<li><a href="https://github.com/acedergr" target="_blank" rel="noopener" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">GitHub</a></li>
						<li><a href="https://linkedin.com/in/acedergren" target="_blank" rel="noopener" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">LinkedIn</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Legal</h4>
					<ul class="space-y-2">
						<li><a href="/terms" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">Terms</a></li>
						<li><a href="/privacy" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-on-surface dark:hover:text-md-dark-on-surface transition-colors">Privacy</a></li>
					</ul>
				</div>
			</div>
			
			<div class="mt-12 pt-8 border-t border-md-outline dark:border-md-dark-outline">
				<div class="text-center space-y-2">
					<p class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						© 2024 The Solutions Edge by Alexander Cedergren. All rights reserved.
					</p>
					<p class="text-xs text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
						All opinions expressed on this site are my personal views and do not represent the opinions or positions of my employer. My employer is not liable for any content published on this site.
					</p>
				</div>
			</div>
		</div>
	</footer>
</div>