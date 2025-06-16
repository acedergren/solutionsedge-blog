import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import PrerenderPerformanceAnalyzer from './scripts/prerender-performance.js';

// Create performance analyzer instance
const perfAnalyzer = new PrerenderPerformanceAnalyzer();
const prerenderHooks = perfAnalyzer.createPrerenderHooks();

// Start memory monitoring during build
let memoryMonitor;
if (process.env.ANALYZE_PRERENDER) {
	memoryMonitor = perfAnalyzer.startMemoryMonitoring(500);
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: true, // Enable gzip/brotli compression
			strict: true
		}),
		
		prerender: {
			handleHttpError: ({ status, path, referrer, referenceType }) => {
				// Log prerender errors for performance analysis
				if (process.env.ANALYZE_PRERENDER) {
					prerenderHooks.onError({ path, error: new Error(`HTTP ${status}`), status });
				}
				
				// Handle 404s gracefully
				if (status === 404 && path.startsWith('/article/')) {
					console.warn(`Article not found: ${path}`);
					return;
				}
				
				throw new Error(`${status} error on ${path} linked from ${referrer}`);
			},
			
			entries: ['*', '/404'],
			
			// Performance optimizations
			concurrency: 4, // Limit concurrent prerenders to prevent memory issues
			
			// Hook into prerender process for performance monitoring
			onPrerender: process.env.ANALYZE_PRERENDER ? async (details) => {
				await prerenderHooks.onRoute(details);
			} : undefined,
			
			onPrerenderComplete: process.env.ANALYZE_PRERENDER ? async (details) => {
				await prerenderHooks.onRouteComplete(details);
			} : undefined
		},
		
		// Performance hints
		serviceWorker: {
			register: false // Disable for now, enable when implementing PWA
		},
		
		// Optimize CSS handling
		inlineStyleThreshold: 2048, // Inline small CSS files
		
		// Output configuration
		outDir: '.svelte-kit',
		
		// Client-side optimizations
		browser: {
			hydrate: true,
			router: true
		}
	}
};

// Save performance report after build
if (process.env.ANALYZE_PRERENDER) {
	process.on('exit', async () => {
		if (memoryMonitor) {
			clearInterval(memoryMonitor);
		}
		await perfAnalyzer.saveReport();
	});
}

export default config;