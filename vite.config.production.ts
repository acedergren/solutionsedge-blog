import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { compression } from 'vite-plugin-compression2';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
    plugins: [
        sveltekit(),
        
        // Compress assets
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 1024,
            deleteOriginFile: false
        }),
        
        compression({
            algorithm: 'brotliCompress',
            ext: '.br',
            threshold: 1024,
            deleteOriginFile: false
        }),
        
        // Optimize images
        ViteImageOptimizer({
            png: {
                quality: 80
            },
            jpeg: {
                quality: 80
            },
            jpg: {
                quality: 80
            },
            webp: {
                quality: 80
            }
        })
    ],

    build: {
        // Target modern browsers for smaller bundles
        target: 'es2020',
        
        // Optimize chunks
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Core vendor chunk
                    if (id.includes('node_modules')) {
                        if (id.includes('svelte') || id.includes('@sveltejs/kit')) {
                            return 'vendor-framework';
                        }
                        // Separate heavy dependencies
                        if (id.includes('marked') || id.includes('highlight')) {
                            return 'vendor-markdown';
                        }
                        if (id.includes('quill')) {
                            return 'vendor-editor';
                        }
                        // Other vendor code
                        return 'vendor-misc';
                    }
                },
                // Use content hash for better caching
                chunkFileNames: 'chunks/[name]-[hash].js',
                entryFileNames: 'entries/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            },
            // Tree shake more aggressively
            treeshake: {
                moduleSideEffects: false,
                propertyReadSideEffects: false,
                tryCatchDeoptimization: false
            }
        },
        
        // Minification
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                passes: 3,
                unsafe_arrows: true,
                unsafe_comps: true,
                unsafe_methods: true,
                unsafe_proto: true,
                unsafe_regexp: true,
                unsafe_undefined: true
            },
            mangle: {
                safari10: true,
                properties: {
                    regex: /^_/
                }
            },
            format: {
                comments: false,
                ecma: 2020
            }
        },
        
        // Performance settings
        chunkSizeWarningLimit: 500,
        reportCompressedSize: true,
        cssCodeSplit: true,
        assetsInlineLimit: 4096,
        
        // Enable source maps for production debugging
        sourcemap: 'hidden',
        
        // CSS minification
        cssMinify: 'lightningcss'
    },

    // Dependency optimization
    optimizeDeps: {
        include: ['svelte', 'marked', 'highlight.js'],
        exclude: ['@sveltejs/kit'],
        esbuildOptions: {
            target: 'es2020'
        }
    },

    // Production-specific settings
    define: {
        'process.env.NODE_ENV': '"production"'
    },
    
    // Worker optimization
    worker: {
        format: 'es',
        rollupOptions: {
            output: {
                entryFileNames: 'workers/[name]-[hash].js'
            }
        }
    }
});