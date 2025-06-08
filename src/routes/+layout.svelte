<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	
	// Navigation items
	const navItems = [
		{ label: 'Home', href: '/', icon: 'home' },
		{ label: 'Blog', href: '/blog', icon: 'article' },
		{ label: 'About', href: '/about', icon: 'person' },
		{ label: 'Contact', href: '/contact', icon: 'mail' }
	];

	let isMobileMenuOpen = false;
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

<div class="min-h-screen md-surface">
	<!-- Top App Bar -->
	<header class="sticky top-0 z-50 md-surface-container elevation-2">
		<div class="h-16 px-4 flex items-center justify-between max-w-7xl mx-auto">
			<!-- Logo and Title -->
			<div class="flex items-center gap-4">
				<button 
					class="md-icon-button md:hidden"
					on:click={() => isMobileMenuOpen = !isMobileMenuOpen}
					aria-label="Toggle menu"
				>
					<span class="material-icons">menu</span>
				</button>
				
				<a href="/" class="flex items-center gap-3">
					<div class="w-10 h-10 bg-md-primary rounded-full flex items-center justify-center">
						<span class="text-md-on-primary font-bold text-lg">SE</span>
					</div>
					<span class="md-title-large hidden sm:inline">The Solutions Edge</span>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<nav class="hidden md:flex items-center gap-2">
				{#each navItems as item}
					<a 
						href={item.href}
						class="md-button-text {$page.url.pathname === item.href ? 'bg-md-secondary-container text-md-on-secondary-container' : ''}"
					>
						<span class="material-icons text-xl">{item.icon}</span>
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- Theme Toggle -->
			<button class="md-icon-button" aria-label="Toggle theme">
				<span class="material-icons">dark_mode</span>
			</button>
		</div>
	</header>

	<!-- Mobile Navigation Drawer -->
	{#if isMobileMenuOpen}
		<div 
			class="fixed inset-0 bg-md-scrim/50 z-40 md:hidden animate-fade-in"
			on:click={() => isMobileMenuOpen = false}
		>
			<nav class="w-80 h-full bg-md-surface-container-low animate-slide-up">
				<div class="p-6">
					<h2 class="md-title-large mb-8">Navigation</h2>
					{#each navItems as item}
						<a 
							href={item.href}
							class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-md-on-surface/8 transition-colors
								{$page.url.pathname === item.href ? 'bg-md-secondary-container text-md-on-secondary-container' : ''}"
							on:click={() => isMobileMenuOpen = false}
						>
							<span class="material-icons">{item.icon}</span>
							<span class="md-label-large">{item.label}</span>
						</a>
					{/each}
				</div>
			</nav>
		</div>
	{/if}

	<!-- Main Content -->
	<main class="flex-1">
		<slot />
	</main>

	<!-- Footer -->
	<footer class="md-surface-container-low mt-20">
		<div class="max-w-7xl mx-auto px-4 py-12">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
				<!-- About -->
				<div>
					<h3 class="md-title-large mb-4">About</h3>
					<p class="md-body-medium text-md-on-surface-variant">
						The Solutions Edge is a blog focused on cloud computing, edge technologies, and solutions engineering best practices.
					</p>
				</div>

				<!-- Quick Links -->
				<div>
					<h3 class="md-title-large mb-4">Quick Links</h3>
					<div class="flex flex-col gap-2">
						{#each navItems as item}
							<a href={item.href} class="md-body-medium text-md-on-surface-variant hover:text-md-primary transition-colors">
								{item.label}
							</a>
						{/each}
					</div>
				</div>

				<!-- Connect -->
				<div>
					<h3 class="md-title-large mb-4">Connect</h3>
					<div class="flex gap-2">
						<a href="https://github.com" class="md-icon-button-outlined" aria-label="GitHub">
							<span class="material-icons">code</span>
						</a>
						<a href="https://linkedin.com" class="md-icon-button-outlined" aria-label="LinkedIn">
							<span class="material-icons">business</span>
						</a>
						<a href="https://twitter.com" class="md-icon-button-outlined" aria-label="Twitter">
							<span class="material-icons">tag</span>
						</a>
					</div>
				</div>
			</div>

			<div class="mt-8 pt-8 border-t border-md-outline-variant">
				<p class="md-body-small text-md-on-surface-variant text-center">
					© 2024 The Solutions Edge. All rights reserved.
				</p>
			</div>
		</div>
	</footer>
</div>