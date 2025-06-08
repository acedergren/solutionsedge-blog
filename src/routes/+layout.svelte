<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	let isDarkMode = false;
	let isScrolled = false;
	let showSearch = false;
	
	onMount(() => {
		// Check for saved theme preference
		isDarkMode = localStorage.getItem('theme') === 'dark' || 
			(!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
		updateTheme();
		
		// Handle scroll
		const handleScroll = () => {
			isScrolled = window.scrollY > 10;
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
	
	function updateTheme() {
		if (browser) {
			if (isDarkMode) {
				document.documentElement.classList.add('dark');
				localStorage.setItem('theme', 'dark');
			} else {
				document.documentElement.classList.remove('dark');
				localStorage.setItem('theme', 'light');
			}
		}
	}
	
	function toggleTheme() {
		isDarkMode = !isDarkMode;
		updateTheme();
	}
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
</svelte:head>

<div class="min-h-screen">
	<!-- Navigation -->
	<nav class="sticky top-0 z-50 bg-md-surface dark:bg-md-dark-surface border-b {isScrolled ? 'border-md-outline dark:border-md-dark-outline' : 'border-transparent'} transition-all duration-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Logo -->
				<div class="flex items-center gap-8">
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
						<span class="material-icons-outlined text-[20px]">search</span>
					</button>
					
					<!-- Theme Toggle -->
					<button 
						class="p-2 rounded-full hover:bg-md-surface-variant dark:hover:bg-md-dark-surface-variant transition-colors"
						on:click={toggleTheme}
						aria-label="Toggle theme"
					>
						<span class="material-icons-outlined text-[20px]">
							{isDarkMode ? 'light_mode' : 'dark_mode'}
						</span>
					</button>
					
					<!-- Write -->
					<a href="/write" class="hidden sm:flex items-center gap-2 ml-4">
						<span class="material-icons-outlined text-[20px]">edit_note</span>
						<span class="text-sm">Write</span>
					</a>
					
					<!-- Sign In -->
					<button class="btn-primary ml-2">
						Get started
					</button>
				</div>
			</div>
		</div>
		
		<!-- Search Bar -->
		{#if showSearch}
			<div class="border-t border-md-outline dark:border-md-dark-outline">
				<div class="max-w-3xl mx-auto px-4 py-4">
					<div class="relative">
						<input 
							type="search" 
							placeholder="Search stories, topics, and authors"
							class="w-full px-4 py-2 pl-10 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-full focus:outline-none focus:ring-2 focus:ring-md-primary"
							autofocus
						/>
						<span class="material-icons-outlined absolute left-3 top-2.5 text-[20px] text-md-on-surface-variant">
							search
						</span>
					</div>
				</div>
			</div>
		{/if}
	</nav>

	<!-- Main Content -->
	<main>
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-md-surface-variant dark:bg-md-dark-surface border-t border-md-outline dark:border-md-dark-outline mt-20">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<div class="grid grid-cols-2 md:grid-cols-4 gap-8">
				<div>
					<h4 class="font-bold mb-4">Discover</h4>
					<ul class="space-y-2">
						<li><a href="/topics" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Topics</a></li>
						<li><a href="/trending" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Trending</a></li>
						<li><a href="/latest" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Latest</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4">Create</h4>
					<ul class="space-y-2">
						<li><a href="/write" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Write a story</a></li>
						<li><a href="/publish" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Publishing guide</a></li>
						<li><a href="/style-guide" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Style guide</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4">Connect</h4>
					<ul class="space-y-2">
						<li><a href="/about" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">About</a></li>
						<li><a href="/contact" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Contact</a></li>
						<li><a href="/newsletter" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Newsletter</a></li>
					</ul>
				</div>
				<div>
					<h4 class="font-bold mb-4">Legal</h4>
					<ul class="space-y-2">
						<li><a href="/terms" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Terms</a></li>
						<li><a href="/privacy" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Privacy</a></li>
						<li><a href="/help" class="text-sm text-md-on-surface-variant hover:text-md-on-surface">Help</a></li>
					</ul>
				</div>
			</div>
			
			<div class="mt-8 pt-8 border-t border-md-outline dark:border-md-dark-outline">
				<p class="text-sm text-md-on-surface-variant text-center">
					© 2024 The Solutions Edge. Ideas and opinions are our own.
				</p>
			</div>
		</div>
	</footer>
</div>