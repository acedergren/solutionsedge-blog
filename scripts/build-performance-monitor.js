import { performance } from 'perf_hooks';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Performance monitoring class
class BuildPerformanceMonitor {
    constructor() {
        this.metrics = {
            timestamp: new Date().toISOString(),
            totalBuildTime: 0,
            phases: {},
            memoryUsage: {},
            bundleStats: {},
            errors: []
        };
        this.startTime = performance.now();
    }

    async measurePhase(phaseName, fn) {
        const startTime = performance.now();
        const startMemory = process.memoryUsage();
        
        try {
            const result = await fn();
            const endTime = performance.now();
            const endMemory = process.memoryUsage();
            
            this.metrics.phases[phaseName] = {
                duration: endTime - startTime,
                memoryDelta: {
                    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                    external: endMemory.external - startMemory.external,
                    rss: endMemory.rss - startMemory.rss
                }
            };
            
            return result;
        } catch (error) {
            this.metrics.errors.push({
                phase: phaseName,
                error: error.message
            });
            throw error;
        }
    }

    async analyzeBuildOutput() {
        const buildDir = path.join(rootDir, 'build');
        const stats = {
            totalFiles: 0,
            totalSize: 0,
            filesByType: {},
            largestFiles: []
        };

        async function walkDir(dir) {
            const files = await fs.readdir(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory()) {
                    await walkDir(fullPath);
                } else {
                    const stat = await fs.stat(fullPath);
                    const ext = path.extname(file.name);
                    
                    stats.totalFiles++;
                    stats.totalSize += stat.size;
                    
                    if (!stats.filesByType[ext]) {
                        stats.filesByType[ext] = { count: 0, size: 0 };
                    }
                    stats.filesByType[ext].count++;
                    stats.filesByType[ext].size += stat.size;
                    
                    stats.largestFiles.push({
                        path: fullPath.replace(rootDir, ''),
                        size: stat.size
                    });
                }
            }
        }

        try {
            await walkDir(buildDir);
            stats.largestFiles.sort((a, b) => b.size - a.size);
            stats.largestFiles = stats.largestFiles.slice(0, 10);
            this.metrics.bundleStats = stats;
        } catch (error) {
            console.error('Error analyzing build output:', error);
        }
    }

    async analyzeTreeShaking() {
        // Analyze imports and exports to detect unused code
        const analysis = {
            totalImports: 0,
            unusedExports: [],
            circularDependencies: []
        };

        try {
            // Run rollup-plugin-visualizer for detailed analysis
            const { stdout } = await execAsync('npx vite build --mode analyze', {
                cwd: rootDir,
                env: { ...process.env, ANALYZE: 'true' }
            });
            
            // Parse vite output for tree-shaking info
            const treeShakeMatch = stdout.match(/tree-shaking removed (\d+) unused exports/);
            if (treeShakeMatch) {
                analysis.removedExports = parseInt(treeShakeMatch[1]);
            }
        } catch (error) {
            console.error('Tree-shaking analysis failed:', error);
        }

        return analysis;
    }

    async runBuild() {
        console.log('🚀 Starting SvelteKit build performance analysis...\n');

        // Clean previous build
        await this.measurePhase('clean', async () => {
            await execAsync('rm -rf build .svelte-kit', { cwd: rootDir });
        });

        // Install dependencies (if needed)
        await this.measurePhase('dependencies', async () => {
            const { stdout } = await execAsync('npm ci --prefer-offline', { cwd: rootDir });
            return stdout;
        });

        // TypeScript compilation
        await this.measurePhase('typecheck', async () => {
            const { stdout } = await execAsync('npm run check', { cwd: rootDir });
            return stdout;
        });

        // Main build process
        await this.measurePhase('build', async () => {
            const { stdout } = await execAsync('npm run build', { 
                cwd: rootDir,
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            return stdout;
        });

        // Analyze build output
        await this.measurePhase('analysis', async () => {
            await this.analyzeBuildOutput();
            this.metrics.treeShaking = await this.analyzeTreeShaking();
        });

        this.metrics.totalBuildTime = performance.now() - this.startTime;
        
        return this.metrics;
    }

    async compareWithPrevious() {
        const historyFile = path.join(rootDir, '.build-metrics-history.json');
        let history = [];
        
        try {
            const data = await fs.readFile(historyFile, 'utf-8');
            history = JSON.parse(data);
        } catch (error) {
            // No history file yet
        }

        // Add current metrics to history
        history.push(this.metrics);
        
        // Keep only last 10 builds
        if (history.length > 10) {
            history = history.slice(-10);
        }

        await fs.writeFile(historyFile, JSON.stringify(history, null, 2));

        // Compare with previous build
        if (history.length > 1) {
            const previous = history[history.length - 2];
            const current = this.metrics;
            
            const comparison = {
                totalBuildTime: {
                    previous: previous.totalBuildTime,
                    current: current.totalBuildTime,
                    delta: current.totalBuildTime - previous.totalBuildTime,
                    percentChange: ((current.totalBuildTime - previous.totalBuildTime) / previous.totalBuildTime) * 100
                },
                bundleSize: {
                    previous: previous.bundleStats.totalSize,
                    current: current.bundleStats.totalSize,
                    delta: current.bundleStats.totalSize - previous.bundleStats.totalSize,
                    percentChange: ((current.bundleStats.totalSize - previous.bundleStats.totalSize) / previous.bundleStats.totalSize) * 100
                }
            };

            return comparison;
        }

        return null;
    }

    generateReport() {
        console.log('\n📊 Build Performance Report\n');
        console.log('=' . repeat(60));
        
        // Overall metrics
        console.log(`\n⏱️  Total Build Time: ${(this.metrics.totalBuildTime / 1000).toFixed(2)}s`);
        console.log(`📅 Timestamp: ${this.metrics.timestamp}`);
        
        // Phase breakdown
        console.log('\n📈 Phase Breakdown:');
        for (const [phase, data] of Object.entries(this.metrics.phases)) {
            console.log(`   ${phase}: ${(data.duration / 1000).toFixed(2)}s (Memory Δ: ${(data.memoryDelta.heapUsed / 1024 / 1024).toFixed(2)}MB)`);
        }
        
        // Bundle stats
        console.log('\n📦 Bundle Statistics:');
        console.log(`   Total Files: ${this.metrics.bundleStats.totalFiles}`);
        console.log(`   Total Size: ${(this.metrics.bundleStats.totalSize / 1024 / 1024).toFixed(2)}MB`);
        console.log('\n   File Types:');
        for (const [ext, data] of Object.entries(this.metrics.bundleStats.filesByType)) {
            console.log(`     ${ext}: ${data.count} files (${(data.size / 1024 / 1024).toFixed(2)}MB)`);
        }
        
        // Largest files
        console.log('\n   Largest Files:');
        for (const file of this.metrics.bundleStats.largestFiles.slice(0, 5)) {
            console.log(`     ${file.path}: ${(file.size / 1024).toFixed(2)}KB`);
        }
        
        // Tree-shaking info
        if (this.metrics.treeShaking) {
            console.log('\n🌳 Tree-Shaking Analysis:');
            console.log(`   Removed Exports: ${this.metrics.treeShaking.removedExports || 'N/A'}`);
        }
        
        // Errors
        if (this.metrics.errors.length > 0) {
            console.log('\n❌ Errors:');
            for (const error of this.metrics.errors) {
                console.log(`   ${error.phase}: ${error.error}`);
            }
        }
        
        console.log('\n' + '=' . repeat(60));
    }

    async saveDetailedReport() {
        const reportPath = path.join(rootDir, 'build-performance-report.json');
        await fs.writeFile(reportPath, JSON.stringify(this.metrics, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }
}

// Run the performance monitor
async function main() {
    const monitor = new BuildPerformanceMonitor();
    
    try {
        await monitor.runBuild();
        const comparison = await monitor.compareWithPrevious();
        
        monitor.generateReport();
        
        if (comparison) {
            console.log('\n📊 Comparison with Previous Build:');
            console.log(`   Build Time: ${comparison.totalBuildTime.delta > 0 ? '🔴' : '🟢'} ${comparison.totalBuildTime.percentChange.toFixed(1)}%`);
            console.log(`   Bundle Size: ${comparison.bundleSize.delta > 0 ? '🔴' : '🟢'} ${comparison.bundleSize.percentChange.toFixed(1)}%`);
        }
        
        await monitor.saveDetailedReport();
        
        // Set exit code based on performance regression
        if (comparison && comparison.totalBuildTime.percentChange > 10) {
            console.log('\n⚠️  Warning: Build time increased by more than 10%');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('\n❌ Build performance analysis failed:', error);
        process.exit(1);
    }
}

main();