import { performance } from 'perf_hooks';
import v8 from 'v8';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class PrerenderPerformanceAnalyzer {
    constructor() {
        this.metrics = {
            routes: {},
            memory: {
                snapshots: [],
                leaks: []
            },
            summary: {
                totalRoutes: 0,
                totalTime: 0,
                avgTimePerRoute: 0,
                slowestRoutes: [],
                memoryLeaks: false
            }
        };
        this.startMemory = process.memoryUsage();
        this.routeTimings = new Map();
    }

    // Hook into SvelteKit's prerendering process
    createPrerenderHooks() {
        const self = this;
        
        return {
            async onRoute({ route, path: routePath }) {
                const startTime = performance.now();
                const startMemory = process.memoryUsage();
                
                self.routeTimings.set(routePath, {
                    startTime,
                    startMemory,
                    route
                });
                
                console.log(`⏳ Prerendering: ${routePath}`);
            },
            
            async onRouteComplete({ path: routePath, html, headers }) {
                const timing = self.routeTimings.get(routePath);
                if (!timing) return;
                
                const endTime = performance.now();
                const endMemory = process.memoryUsage();
                const duration = endTime - timing.startTime;
                
                self.metrics.routes[routePath] = {
                    duration,
                    htmlSize: html.length,
                    memoryDelta: {
                        heapUsed: endMemory.heapUsed - timing.startMemory.heapUsed,
                        external: endMemory.external - timing.startMemory.external
                    },
                    timestamp: new Date().toISOString()
                };
                
                // Check for potential memory leaks
                if ((endMemory.heapUsed - timing.startMemory.heapUsed) > 50 * 1024 * 1024) {
                    self.metrics.memory.leaks.push({
                        route: routePath,
                        leakSize: endMemory.heapUsed - timing.startMemory.heapUsed
                    });
                }
                
                console.log(`✅ Completed: ${routePath} (${duration.toFixed(2)}ms, ${(html.length / 1024).toFixed(2)}KB)`);
            },
            
            async onError({ path: routePath, error, status }) {
                console.error(`❌ Error prerendering ${routePath}:`, error);
                self.metrics.routes[routePath] = {
                    error: error.message,
                    status,
                    timestamp: new Date().toISOString()
                };
            }
        };
    }

    // Monitor memory during prerendering
    startMemoryMonitoring(interval = 1000) {
        const self = this;
        
        return setInterval(() => {
            const memUsage = process.memoryUsage();
            const heapStats = v8.getHeapStatistics();
            
            self.metrics.memory.snapshots.push({
                timestamp: Date.now(),
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss,
                heapUsedPercent: (heapStats.used_heap_size / heapStats.heap_size_limit) * 100
            });
            
            // Detect memory pressure
            if (heapStats.used_heap_size / heapStats.heap_size_limit > 0.9) {
                console.warn('⚠️  High memory pressure detected during prerendering!');
                global.gc && global.gc(); // Force garbage collection if available
            }
        }, interval);
    }

    // Analyze component rendering performance
    async analyzeComponentPerformance() {
        const componentsDir = path.join(rootDir, 'src/lib/components');
        const analysis = {};
        
        try {
            const files = await fs.readdir(componentsDir);
            
            for (const file of files) {
                if (file.endsWith('.svelte')) {
                    const content = await fs.readFile(path.join(componentsDir, file), 'utf-8');
                    
                    // Analyze component complexity
                    analysis[file] = {
                        size: content.length,
                        hasReactiveStatements: /$:/.test(content),
                        hasStores: /\$\w+/.test(content),
                        hasOnMount: /onMount/.test(content),
                        hasAsyncData: /async|await|fetch/.test(content),
                        scriptBlocks: (content.match(/<script/g) || []).length,
                        complexity: this.calculateComplexity(content)
                    };
                }
            }
        } catch (error) {
            console.error('Error analyzing components:', error);
        }
        
        return analysis;
    }

    calculateComplexity(content) {
        let complexity = 0;
        
        // Reactive statements add complexity
        complexity += (content.match(/\$:/g) || []).length * 2;
        
        // Event handlers
        complexity += (content.match(/on:\w+/g) || []).length;
        
        // Conditionals
        complexity += (content.match(/\{#if/g) || []).length * 2;
        complexity += (content.match(/\{#each/g) || []).length * 3;
        
        // Async operations
        complexity += (content.match(/await/g) || []).length * 3;
        
        return complexity;
    }

    generateSummary() {
        const routes = Object.entries(this.metrics.routes);
        const successfulRoutes = routes.filter(([_, data]) => !data.error);
        
        // Calculate summary statistics
        this.metrics.summary.totalRoutes = routes.length;
        this.metrics.summary.successfulRoutes = successfulRoutes.length;
        this.metrics.summary.failedRoutes = routes.length - successfulRoutes.length;
        
        if (successfulRoutes.length > 0) {
            const totalTime = successfulRoutes.reduce((sum, [_, data]) => sum + data.duration, 0);
            this.metrics.summary.totalTime = totalTime;
            this.metrics.summary.avgTimePerRoute = totalTime / successfulRoutes.length;
            
            // Find slowest routes
            this.metrics.summary.slowestRoutes = successfulRoutes
                .sort((a, b) => b[1].duration - a[1].duration)
                .slice(0, 10)
                .map(([route, data]) => ({
                    route,
                    duration: data.duration,
                    size: data.htmlSize
                }));
        }
        
        // Memory analysis
        if (this.metrics.memory.snapshots.length > 0) {
            const memoryGrowth = this.metrics.memory.snapshots[this.metrics.memory.snapshots.length - 1].heapUsed - 
                                this.metrics.memory.snapshots[0].heapUsed;
            
            this.metrics.summary.memoryGrowth = memoryGrowth;
            this.metrics.summary.memoryLeaks = this.metrics.memory.leaks.length > 0;
        }
    }

    async saveReport() {
        this.generateSummary();
        
        const reportPath = path.join(rootDir, 'prerender-performance-report.json');
        await fs.writeFile(reportPath, JSON.stringify(this.metrics, null, 2));
        
        // Generate human-readable summary
        console.log('\n📊 Prerender Performance Summary\n');
        console.log('=' . repeat(60));
        console.log(`Total Routes: ${this.metrics.summary.totalRoutes}`);
        console.log(`Successful: ${this.metrics.summary.successfulRoutes}`);
        console.log(`Failed: ${this.metrics.summary.failedRoutes}`);
        console.log(`Total Time: ${(this.metrics.summary.totalTime / 1000).toFixed(2)}s`);
        console.log(`Average Time per Route: ${this.metrics.summary.avgTimePerRoute.toFixed(2)}ms`);
        
        if (this.metrics.summary.memoryGrowth) {
            console.log(`Memory Growth: ${(this.metrics.summary.memoryGrowth / 1024 / 1024).toFixed(2)}MB`);
        }
        
        console.log('\n🐌 Slowest Routes:');
        for (const route of this.metrics.summary.slowestRoutes.slice(0, 5)) {
            console.log(`   ${route.route}: ${route.duration.toFixed(2)}ms (${(route.size / 1024).toFixed(2)}KB)`);
        }
        
        if (this.metrics.memory.leaks.length > 0) {
            console.log('\n⚠️  Potential Memory Leaks Detected:');
            for (const leak of this.metrics.memory.leaks) {
                console.log(`   ${leak.route}: ${(leak.leakSize / 1024 / 1024).toFixed(2)}MB`);
            }
        }
        
        console.log('\n' + '=' . repeat(60));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }
}

// Export for use in svelte.config.js
export default PrerenderPerformanceAnalyzer;