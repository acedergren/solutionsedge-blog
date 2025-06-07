<script>
  import '../app.css';
  import { page } from '$app/stores';
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Archives', href: '/archives' },
  ];
</script>

<svelte:head>
  <title>The Solutions Edge</title>
  <meta name="description" content="A Solutions Engineering, Cloud Security and Edge Computing Blog" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
</svelte:head>

<div class="min-h-screen bg-md-dark-surface">
  <!-- Navigation -->
  <nav class="sticky top-0 z-50 bg-md-dark-surface-container elevation-2">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and site title -->
        <div class="flex items-center">
          <a href="/" class="flex items-center gap-3">
            <img src="/images/solutionsedgelogo.png" alt="The Solutions Edge" class="h-8 w-8" />
            <span class="font-display text-xl font-bold text-md-dark-on-surface">The Solutions Edge</span>
          </a>
        </div>

        <!-- Navigation links -->
        <div class="hidden md:flex items-center gap-8">
          {#each navigation as item}
            <a 
              href={item.href} 
              class="text-md-dark-on-surface-variant hover:text-md-dark-primary transition-colors duration-200 font-medium
                     {$page.url.pathname === item.href ? 'text-md-dark-primary' : ''}"
            >
              {item.name}
            </a>
          {/each}
        </div>

        <!-- Mobile menu button -->
        <button class="md:hidden p-2 rounded-lg hover:bg-md-dark-surface-container-high" aria-label="Toggle navigation menu">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- Main content -->
  <main class="flex-1">
    <slot />
  </main>

  <!-- Footer -->
  <footer class="bg-md-dark-surface-container mt-24">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About section -->
        <div>
          <h3 class="font-display text-lg font-semibold mb-4">About</h3>
          <p class="text-md-dark-on-surface-variant text-sm">
            A Solutions Engineering, Cloud Security and Edge Computing Blog by Alexander Cedergren.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="font-display text-lg font-semibold mb-4">Links</h3>
          <div class="flex flex-col gap-2">
            <a href="https://github.com/yourusername" class="text-md-dark-on-surface-variant hover:text-md-dark-primary text-sm">
              GitHub
            </a>
            <a href="https://linkedin.com/in/yourusername" class="text-md-dark-on-surface-variant hover:text-md-dark-primary text-sm">
              LinkedIn
            </a>
          </div>
        </div>

        <!-- Copyright -->
        <div>
          <h3 class="font-display text-lg font-semibold mb-4">Legal</h3>
          <p class="text-md-dark-on-surface-variant text-sm">
            © 2024 The Solutions Edge. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</div>