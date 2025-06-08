<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Archives', href: '/archives' },
  ];

  let darkMode = true;
  let mobileMenuOpen = false;

  onMount(() => {
    // Check for saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme');
    darkMode = savedTheme !== 'light';
    updateTheme();
  });

  function toggleTheme() {
    darkMode = !darkMode;
    updateTheme();
  }

  function updateTheme() {
    if (darkMode) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }
</script>

<svelte:head>
  <title>The Solutions Edge</title>
  <meta name="description" content="A Solutions Engineering, Cloud Security and Edge Computing Blog" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
</svelte:head>

<div class="min-h-screen md-surface">
  <!-- Navigation -->
  <nav class="sticky top-0 z-50 md-surface-container elevation-2">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and site title -->
        <div class="flex items-center">
          <a href="/" class="flex items-center gap-3">
            <div class="h-10 w-10 bg-primary rounded-lg p-1.5">
              <svg viewBox="0 0 100 100" class="w-full h-full fill-on-primary">
                <path d="M50 10 L80 30 L80 70 L50 90 L20 70 L20 30 Z M35 40 L35 60 L45 60 L45 50 L55 50 L55 40 Z M55 50 L55 60 L65 60 L65 40 L55 40 Z"/>
              </svg>
            </div>
            <span class="font-display text-xl font-bold">The Solutions Edge</span>
          </a>
        </div>

        <!-- Navigation links -->
        <div class="hidden md:flex items-center gap-6">
          {#each navigation as item}
            <a 
              href={item.href} 
              class="text-on-surface-variant hover:text-primary transition-colors duration-200 font-medium
                     {$page.url.pathname === item.href ? 'text-primary' : ''}"
            >
              {item.name}
            </a>
          {/each}
          
          <!-- Theme toggle -->
          <button 
            on:click={toggleTheme}
            class="p-2 rounded-full hover:bg-primary/10 transition-colors"
            aria-label="Toggle theme"
          >
            {#if darkMode}
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            {:else}
              <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            {/if}
          </button>
        </div>

        <!-- Mobile menu button -->
        <button 
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          class="md:hidden p-2 rounded-lg hover:bg-surface-container-high" 
          aria-label="Toggle navigation menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile menu -->
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-outline">
        <div class="px-2 pt-2 pb-3 space-y-1">
          {#each navigation as item}
            <a 
              href={item.href} 
              on:click={() => mobileMenuOpen = false}
              class="block px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/10
                     {$page.url.pathname === item.href ? 'text-primary' : 'text-on-surface-variant'}"
            >
              {item.name}
            </a>
          {/each}
          <button 
            on:click={toggleTheme}
            class="w-full text-left px-3 py-2 rounded-lg text-base font-medium hover:bg-primary/10 flex items-center gap-2"
          >
            {#if darkMode}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Light Mode
            {:else}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark Mode
            {/if}
          </button>
        </div>
      </div>
    {/if}
  </nav>

  <!-- Main content -->
  <main class="flex-1">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="md-surface-container mt-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About section -->
        <div>
          <h3 class="font-display text-lg font-semibold mb-4">About</h3>
          <p class="text-on-surface-variant text-sm">
            A Solutions Engineering, Cloud Security and Edge Computing Blog by Alexander Cedergren.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="font-display text-lg font-semibold mb-4">Links</h3>
          <div class="flex flex-col gap-2">
            <a href="https://github.com/yourusername" class="text-on-surface-variant hover:text-primary text-sm transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com/in/yourusername" class="text-on-surface-variant hover:text-primary text-sm transition-colors">
              LinkedIn
            </a>
          </div>
        </div>

        <!-- Copyright -->
        <div>
          <h3 class="font-display text-lg font-semibold mb-4">Legal</h3>
          <p class="text-on-surface-variant text-sm">
            © 2024 The Solutions Edge. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</div>