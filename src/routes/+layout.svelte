<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getAllArticles } from '$lib/content';
	import CookieConsent from '$lib/components/CookieConsent.svelte';
	import CookieRejectionInfo from '$lib/components/CookieRejectionInfo.svelte';
	
	let isDarkMode = false;
	let isScrolled = false;
	let showSearch = false;
	let showMobileMenu = false;
	let mounted = false;
	
	$: if (browser && mounted) {
		updateTheme();
	}
	
	onMount(() => {
		mounted = true;
		
		// Set mPulse page classification variables
		if (typeof window !== 'undefined') {
			// Page type classification for mPulse
			const path = window.location.pathname;
			
			if (path === '/') {
				window.pageType = 'homepage';
				window.pageGroup = 'homepage';
			} else if (path.startsWith('/article/')) {
				window.pageType = 'article';
				window.pageGroup = 'content';
				window.contentType = 'article';
			} else if (path.startsWith('/topic/')) {
				window.pageType = 'topic';
				window.pageGroup = 'taxonomy';
				window.contentType = 'topic-listing';
			} else if (path === '/topics') {
				window.pageType = 'topics-index';
				window.pageGroup = 'taxonomy';
				window.contentType = 'topics-overview';
			} else if (path === '/about') {
				window.pageType = 'about';
				window.pageGroup = 'static';
			} else if (path === '/contact') {
				window.pageType = 'contact';
				window.pageGroup = 'static';
			} else if (path === '/help') {
				window.pageType = 'help';
				window.pageGroup = 'support';
			} else if (path.match(/\/(privacy|terms)/)) {
				window.pageType = 'legal';
				window.pageGroup = 'static';
			} else {
				window.pageType = 'other';
				window.pageGroup = 'other';
			}
			
			// Additional mPulse variables
			window.siteSection = window.pageGroup;
			window.contentCategory = window.contentType || window.pageType;
		}
		
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
		updateTheme();
	}
	
	// Simple search functionality
	let searchQuery = '';
	let searchResults: Array<{title: string, url: string}> = [];
	
	function handleSearch() {
		if (searchQuery.trim()) {
			// Get all articles and search through them
			const articles = getAllArticles();
			const articleResults = articles
				.filter(article => 
					article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
					article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
				)
				.map(article => ({
					title: article.title,
					url: `/article/${article.id}`
				}));
			
			// Also search through topics
			const topics = [
				{ title: 'Cloud Infrastructure', url: '/topic/cloud-infrastructure' },
				{ title: 'Edge Computing', url: '/topic/edge-computing' },
				{ title: 'Kubernetes', url: '/topic/kubernetes' },
				{ title: 'Security', url: '/topic/security' },
				{ title: 'DevOps', url: '/topic/devops' },
				{ title: 'AI/ML', url: '/topic/ai-ml' },
				{ title: 'Automation', url: '/topic/automation' }
			];
			
			const topicResults = topics.filter(topic => 
				topic.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
			
			searchResults = [...articleResults, ...topicResults];
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

<div class="min-h-screen bg-md-surface dark:bg-md-dark-surface text-md-on-surface dark:text-md-dark-on-surface transition-colors duration-200" data-page-type="{$page.url.pathname === '/' ? 'homepage' : $page.url.pathname.startsWith('/article/') ? 'article' : $page.url.pathname.startsWith('/topic/') ? 'topic' : $page.url.pathname === '/topics' ? 'topics-index' : 'other'}" data-page-group="{$page.url.pathname === '/' ? 'homepage' : $page.url.pathname.startsWith('/article/') || $page.url.pathname.startsWith('/topic/') || $page.url.pathname === '/topics' ? 'content' : 'static'}">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-md-surface dark:bg-md-dark-surface border-b {isScrolled ? 'border-md-outline dark:border-md-dark-outline shadow-sm' : 'border-transparent'} transition-all duration-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16 md:h-20">
				<!-- Logo and Desktop Nav -->
				<div class="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
					<a href="/" class="flex items-center gap-2 sm:gap-3">
						<div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
							<span class="text-white font-bold text-sm sm:text-base">SE</span>
						</div>
						<span class="text-lg sm:text-xl font-bold hidden min-[420px]:inline">The Solutions Edge</span>
					</a>
					
					<!-- Desktop Nav -->
					<nav class="hidden md:flex items-center gap-1">
						<a href="/" class="nav-link px-3 lg:px-4 py-2 {$page.url.pathname === '/' ? 'nav-link-active' : ''}">
							Home
						</a>
						<a href="/about" class="nav-link px-3 lg:px-4 py-2 {$page.url.pathname === '/about' ? 'nav-link-active' : ''}">
							About
						</a>
						<a href="/topics" class="nav-link px-3 lg:px-4 py-2 {$page.url.pathname === '/topics' ? 'nav-link-active' : ''}">
							Topics
						</a>
					</nav>
				</div>

				<!-- Right side -->
				<div class="flex items-center gap-2">
					<!-- Enhanced Search Button -->
					<button 
						class="p-2 rounded-full hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-all duration-300 hover:scale-110 ripple"
						on:click={() => showSearch = !showSearch}
						aria-label="Search"
					>
						<svg class="w-5 h-5 transition-transform duration-200 {showSearch ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
					</button>
					
					<!-- Enhanced Theme Toggle -->
					{#if mounted}
						<button 
							class="p-2 rounded-full hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-all duration-300 hover:scale-110 ripple"
							on:click={toggleTheme}
							aria-label="Toggle theme"
						>
							<div class="relative overflow-hidden">
								{#if isDarkMode}
									<svg class="w-5 h-5 transition-all duration-500 transform {isDarkMode ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
									</svg>
								{:else}
									<svg class="w-5 h-5 transition-all duration-500 transform {!isDarkMode ? 'rotate-0 opacity-100' : '-rotate-180 opacity-0'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
									</svg>
								{/if}
							</div>
						</button>
					{/if}
					
					<!-- Mobile menu button -->
					<button 
						class="md:hidden p-2 rounded-full hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors" 
						aria-label="Menu"
						on:click={() => showMobileMenu = !showMobileMenu}
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							{#if showMobileMenu}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							{:else}
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
							{/if}
						</svg>
					</button>
				</div>
			</div>
		</div>
		
		<!-- Mobile Menu -->
		{#if showMobileMenu}
			<div class="md:hidden border-t border-md-outline dark:border-md-dark-outline bg-md-surface dark:bg-md-dark-surface">
				<nav class="px-4 py-2 space-y-1">
					<a 
						href="/" 
						class="block px-3 py-2 rounded-lg text-md-on-surface dark:text-md-dark-on-surface hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors {$page.url.pathname === '/' ? 'bg-md-surface-variant dark:bg-md-dark-surface-variant' : ''}"
						on:click={() => showMobileMenu = false}
					>
						Home
					</a>
					<a 
						href="/about" 
						class="block px-3 py-2 rounded-lg text-md-on-surface dark:text-md-dark-on-surface hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors {$page.url.pathname === '/about' ? 'bg-md-surface-variant dark:bg-md-dark-surface-variant' : ''}"
						on:click={() => showMobileMenu = false}
					>
						About
					</a>
					<a 
						href="/topics" 
						class="block px-3 py-2 rounded-lg text-md-on-surface dark:text-md-dark-on-surface hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors {$page.url.pathname === '/topics' ? 'bg-md-surface-variant dark:bg-md-dark-surface-variant' : ''}"
						on:click={() => showMobileMenu = false}
					>
						Topics
					</a>
					<a 
						href="/contact" 
						class="block px-3 py-2 rounded-lg text-md-on-surface dark:text-md-dark-on-surface hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors {$page.url.pathname === '/contact' ? 'bg-md-surface-variant dark:bg-md-dark-surface-variant' : ''}"
						on:click={() => showMobileMenu = false}
					>
						Contact
					</a>
				</nav>
			</div>
		{/if}
		
		<!-- Enhanced Search Interface -->
		{#if showSearch}
			<div class="border-t border-md-outline dark:border-md-dark-outline bg-md-surface dark:bg-md-dark-surface">
				<div class="max-w-3xl mx-auto px-4 py-4">
					<div class="search-container {searchQuery ? 'active' : ''}">
						<input 
							type="search" 
							bind:value={searchQuery}
							on:input={handleSearch}
							placeholder="Search stories, topics, and authors"
							class="search-input"
						/>
						<svg class="w-5 h-5 absolute left-3 top-3.5 text-md-on-surface-variant transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<button 
							on:click={closeSearch}
							class="absolute right-3 top-3.5 text-md-on-surface-variant hover:text-md-on-surface transition-colors ripple"
							aria-label="Close search"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					
						<!-- Enhanced Search Results -->
						<div class="search-results">
							{#if searchResults.length > 0}
								<div class="max-h-96 overflow-y-auto">
									<div class="stagger-container animate">
										{#each searchResults as result, i}
											<a 
												href={result.url} 
												class="stagger-item block px-4 py-3 hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-all duration-200 border-b border-md-outline dark:border-md-dark-outline last:border-0 hover-lift"
												on:click={closeSearch}
											>
												<p class="font-medium text-md-on-surface dark:text-md-dark-on-surface">{result.title}</p>
											</a>
										{/each}
									</div>
								</div>
							{:else if searchQuery.trim()}
								<div class="p-4 text-center text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
									<div class="content-reveal visible">
										No results found for "{searchQuery}"
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}
	</nav>

	<!-- Main Content -->
	<main>
		<slot />
	</main>
	
	<!-- Floating Action Button -->
	<div class="md-fab" role="button" tabindex="0" aria-label="Scroll to top">
		<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
		</svg>
	</div>

	<!-- Footer -->
	<footer class="bg-gradient-to-b from-md-surface to-md-surface-variant dark:from-md-dark-surface dark:to-md-dark-surface-variant border-t border-md-outline dark:border-md-dark-outline mt-16">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
			<!-- Footer Logo & Tagline -->
			<div class="mb-12 text-center">
				<div class="flex items-center justify-center gap-3 mb-4">
					<div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
						<span class="text-white font-bold text-lg">SE</span>
					</div>
					<span class="text-2xl font-bold text-md-on-surface dark:text-md-dark-on-surface">The Solutions Edge</span>
				</div>
				<p class="text-md-on-surface-variant dark:text-md-dark-on-surface-variant max-w-2xl mx-auto">
					Exploring cloud computing, edge technologies, and modern infrastructure solutions through real-world experiences and technical insights.
				</p>
			</div>
			
			<div class="grid grid-cols-2 md:grid-cols-5 gap-8">
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Explore</h4>
					<ul class="space-y-2">
						<li><a href="/" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Home</a></li>
						<li><a href="/topics" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">All Topics</a></li>
						<li><a href="/about" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">About</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Topics</h4>
					<ul class="space-y-2">
						<li><a href="/topic/cloud-infrastructure" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Cloud Infrastructure</a></li>
						<li><a href="/topic/kubernetes" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Kubernetes</a></li>
						<li><a href="/topic/edge-computing" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Edge Computing</a></li>
						<li><a href="/topic/devops" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">DevOps</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Resources</h4>
					<ul class="space-y-2">
						<li><a href="/help" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Help Center</a></li>
						<li><a href="/contact" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Contact</a></li>
						<li><a href="https://github.com/acedergr/alecs" target="_blank" rel="noopener" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors flex items-center gap-1">
							ALECS Project
							<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
							</svg>
						</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Connect</h4>
					<ul class="space-y-2">
						<li>
							<a href="https://github.com/acedergren" target="_blank" rel="noopener" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors flex items-center gap-2">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
								</svg>
								GitHub
							</a>
						</li>
						<li>
							<a href="https://www.linkedin.com/in/acedergr/" target="_blank" rel="noopener" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors flex items-center gap-2">
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
								</svg>
								LinkedIn
							</a>
						</li>
						<li>
							<a href="mailto:alex@solutionsedge.io" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								Email
							</a>
						</li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4 text-md-on-surface dark:text-md-dark-on-surface">Legal</h4>
					<ul class="space-y-2">
						<li><a href="/terms" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Terms of Service</a></li>
						<li><a href="/privacy" class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors">Privacy Policy</a></li>
						<li>
							<button 
								on:click={() => window.openCookieSettings && window.openCookieSettings()} 
								class="text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant hover:text-md-primary transition-colors text-left"
							>
								Cookie Settings
							</button>
						</li>
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

<!-- Cookie Consent Banner -->
<CookieConsent />

<!-- Cookie Rejection Info -->
<CookieRejectionInfo />