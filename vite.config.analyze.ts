import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import type { Plugin } from 'vite';

// Custom plugin to track build performance
function buildPerformancePlugin(): Plugin {
    let startTime: number;
    const timings: Record<string, number> = {};

    return {
        name: 'build-performance',
        buildStart() {
            startTime = Date.now();
            console.log('🚀 Build started at:', new Date().toISOString());
        },
        transform(code, id) {
            // Track transformation time for large files
            if (code.length > 10000) {
                const start = Date.now();
                return {
                    code,
                    map: null,
                    meta: {
                        transformTime: Date.now() - start,
                        fileSize: code.length
                    }
                };
            }
            return null;
        },
        buildEnd() {
            timings.buildDuration = Date.now() - startTime;
            console.log(`✅ Build completed in ${timings.buildDuration}ms`);
        },
        closeBundle() {
            // Save timing data for analysis
            console.log('\n📊 Build Performance Metrics:');
            console.log(JSON.stringify(timings, null, 2));
        }
    };
}

export default defineConfig({
    plugins: [
        sveltekit(),
        buildPerformancePlugin(),
        // Bundle analyzer - only in analyze mode
        process.env.ANALYZE && visualizer({
            filename: './build-stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap', // or 'sunburst', 'network'
        })
    ].filter(Boolean),

    build: {
        // Enable detailed rollup output
        rollupOptions: {
            output: {
                // Manual chunks for better code splitting
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        if (id.includes('svelte') || id.includes('@sveltejs/kit')) {
                            return 'vendor';
                        }
                        if (id.includes('marked') || id.includes('highlight')) {
                            return 'markdown';
                        }
                    }
                    return undefined;
                },
                // Add detailed comments in dev mode
                ...(process.env.NODE_ENV === 'development' && {
                    intro: '/* Build timestamp: ' + new Date().toISOString() + ' */'
                })
            }
        },
        
        // Source map for debugging
        sourcemap: process.env.NODE_ENV === 'development',
        
        // Minification settings
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: process.env.NODE_ENV === 'production',
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
                passes: 2
            },
            mangle: {
                safari10: true
            },
            format: {
                comments: false
            }
        },
        
        // Chunk size warnings
        chunkSizeWarningLimit: 500,
        
        // Asset size reporting
        reportCompressedSize: true,
        
        // CSS code splitting
        cssCodeSplit: true,
        
        // Asset inlining threshold
        assetsInlineLimit: 4096
    },

    // Optimization settings
    optimizeDeps: {
        include: ['svelte', 'marked', 'highlight.js'],
        exclude: ['@sveltejs/kit']
    },

    // Performance hints
    server: {
        warmup: {
            clientFiles: ['./src/app.html', './src/routes/+layout.svelte']
        }
    },

    // Preview server for performance testing
    preview: {
        headers: {
            'Cache-Control': 'public, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
        }
    }
});