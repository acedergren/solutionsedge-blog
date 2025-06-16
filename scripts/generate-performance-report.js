import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class PerformanceReportGenerator {
    constructor() {
        this.report = {
            generated: new Date().toISOString(),
            buildMetrics: null,
            prerenderMetrics: null,
            bundleAnalysis: null,
            recommendations: [],
            score: {
                build: 0,
                bundle: 0,
                prerender: 0,
                overall: 0
            }
        };
    }

    async loadMetrics() {
        // Load build performance metrics
        try {
            const buildData = await fs.readFile(
                path.join(rootDir, 'build-performance-report.json'), 
                'utf-8'
            );
            this.report.buildMetrics = JSON.parse(buildData);
        } catch (error) {
            console.warn('No build performance data found');
        }

        // Load prerender metrics
        try {
            const prerenderData = await fs.readFile(
                path.join(rootDir, 'prerender-performance-report.json'), 
                'utf-8'
            );
            this.report.prerenderMetrics = JSON.parse(prerenderData);
        } catch (error) {
            console.warn('No prerender performance data found');
        }

        // Load bundle analysis
        try {
            const bundleStats = await fs.readFile(
                path.join(rootDir, 'build/bundle-stats.json'), 
                'utf-8'
            );
            this.report.bundleAnalysis = JSON.parse(bundleStats);
        } catch (error) {
            console.warn('No bundle analysis data found');
        }
    }

    calculateScores() {
        // Build performance score (0-100)
        if (this.report.buildMetrics) {
            const buildTime = this.report.buildMetrics.totalBuildTime;
            
            // Scoring: <30s = 100, >5min = 0
            if (buildTime < 30000) {
                this.report.score.build = 100;
            } else if (buildTime > 300000) {
                this.report.score.build = 0;
            } else {
                this.report.score.build = Math.round(
                    100 - ((buildTime - 30000) / 270000) * 100
                );
            }
        }

        // Bundle size score (0-100)
        if (this.report.buildMetrics?.bundleStats) {
            const totalSize = this.report.buildMetrics.bundleStats.totalSize;
            
            // Scoring: <1MB = 100, >10MB = 0
            if (totalSize < 1024 * 1024) {
                this.report.score.bundle = 100;
            } else if (totalSize > 10 * 1024 * 1024) {
                this.report.score.bundle = 0;
            } else {
                this.report.score.bundle = Math.round(
                    100 - ((totalSize - 1024 * 1024) / (9 * 1024 * 1024)) * 100
                );
            }
        }

        // Prerender performance score (0-100)
        if (this.report.prerenderMetrics?.summary) {
            const avgTime = this.report.prerenderMetrics.summary.avgTimePerRoute;
            
            // Scoring: <100ms = 100, >1000ms = 0
            if (avgTime < 100) {
                this.report.score.prerender = 100;
            } else if (avgTime > 1000) {
                this.report.score.prerender = 0;
            } else {
                this.report.score.prerender = Math.round(
                    100 - ((avgTime - 100) / 900) * 100
                );
            }
        }

        // Overall score (weighted average)
        const scores = [
            this.report.score.build,
            this.report.score.bundle,
            this.report.score.prerender
        ].filter(s => s > 0);

        if (scores.length > 0) {
            this.report.score.overall = Math.round(
                scores.reduce((a, b) => a + b, 0) / scores.length
            );
        }
    }

    generateRecommendations() {
        const recommendations = [];

        // Build time recommendations
        if (this.report.buildMetrics) {
            const buildTime = this.report.buildMetrics.totalBuildTime;
            
            if (buildTime > 60000) {
                recommendations.push({
                    category: 'Build Performance',
                    severity: 'high',
                    issue: `Build time is ${(buildTime / 1000).toFixed(1)}s`,
                    recommendation: 'Consider implementing build caching, parallel processing, or upgrading build hardware'
                });
            }

            // TypeScript check time
            if (this.report.buildMetrics.phases?.typecheck?.duration > 10000) {
                recommendations.push({
                    category: 'TypeScript',
                    severity: 'medium',
                    issue: 'TypeScript compilation is slow',
                    recommendation: 'Use incremental compilation with "tsc --incremental" or consider project references'
                });
            }
        }

        // Bundle size recommendations
        if (this.report.buildMetrics?.bundleStats) {
            const stats = this.report.buildMetrics.bundleStats;
            
            if (stats.totalSize > 5 * 1024 * 1024) {
                recommendations.push({
                    category: 'Bundle Size',
                    severity: 'high',
                    issue: `Total bundle size is ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`,
                    recommendation: 'Implement code splitting, lazy loading, and review dependencies for unnecessary imports'
                });
            }

            // Check for large individual files
            const largeFiles = stats.largestFiles?.filter(f => f.size > 500 * 1024) || [];
            if (largeFiles.length > 0) {
                recommendations.push({
                    category: 'Large Files',
                    severity: 'medium',
                    issue: `${largeFiles.length} files exceed 500KB`,
                    recommendation: 'Consider splitting large files or implementing dynamic imports',
                    details: largeFiles.map(f => `${f.path}: ${(f.size / 1024).toFixed(2)}KB`)
                });
            }

            // Check JavaScript size
            const jsSize = stats.filesByType?.['.js']?.size || 0;
            if (jsSize > 2 * 1024 * 1024) {
                recommendations.push({
                    category: 'JavaScript Size',
                    severity: 'high',
                    issue: `JavaScript bundle is ${(jsSize / 1024 / 1024).toFixed(2)}MB`,
                    recommendation: 'Enable tree-shaking, remove unused dependencies, and consider dynamic imports'
                });
            }
        }

        // Prerender performance recommendations
        if (this.report.prerenderMetrics?.summary) {
            const summary = this.report.prerenderMetrics.summary;
            
            if (summary.memoryLeaks) {
                recommendations.push({
                    category: 'Memory Leaks',
                    severity: 'critical',
                    issue: `${this.report.prerenderMetrics.memory.leaks.length} potential memory leaks detected`,
                    recommendation: 'Review component lifecycle, ensure proper cleanup in onDestroy, and check for circular references',
                    details: this.report.prerenderMetrics.memory.leaks
                });
            }

            if (summary.avgTimePerRoute > 500) {
                recommendations.push({
                    category: 'Prerender Performance',
                    severity: 'medium',
                    issue: `Average prerender time is ${summary.avgTimePerRoute.toFixed(0)}ms per route`,
                    recommendation: 'Optimize data fetching, reduce component complexity, and consider caching strategies'
                });
            }

            // Slow routes
            const slowRoutes = summary.slowestRoutes?.filter(r => r.duration > 1000) || [];
            if (slowRoutes.length > 0) {
                recommendations.push({
                    category: 'Slow Routes',
                    severity: 'medium',
                    issue: `${slowRoutes.length} routes take over 1 second to prerender`,
                    recommendation: 'Optimize these specific routes with lazy loading or data caching',
                    details: slowRoutes.map(r => `${r.route}: ${r.duration.toFixed(0)}ms`)
                });
            }
        }

        // Missing optimizations
        if (!this.report.buildMetrics?.phases?.compression) {
            recommendations.push({
                category: 'Missing Optimization',
                severity: 'medium',
                issue: 'No compression enabled for static assets',
                recommendation: 'Enable precompression in svelte.config.js with adapter-static'
            });
        }

        this.report.recommendations = recommendations;
    }

    async generateHTMLReport() {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Build Performance Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: #00838f;
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .score-card {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .score {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .score-value {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
        .score-good { color: #4caf50; }
        .score-warning { color: #ff9800; }
        .score-bad { color: #f44336; }
        .section {
            background: white;
            padding: 30px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .recommendation {
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid;
            background: #f9f9f9;
        }
        .recommendation.critical { border-color: #f44336; }
        .recommendation.high { border-color: #ff9800; }
        .recommendation.medium { border-color: #ffc107; }
        .recommendation.low { border-color: #4caf50; }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #f5f5f5;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Build Performance Report</h1>
        <p>Generated: ${this.report.generated}</p>
    </div>

    <div class="score-card">
        <div class="score">
            <h3>Overall Score</h3>
            <div class="score-value ${this.getScoreClass(this.report.score.overall)}">${this.report.score.overall}</div>
        </div>
        <div class="score">
            <h3>Build Performance</h3>
            <div class="score-value ${this.getScoreClass(this.report.score.build)}">${this.report.score.build}</div>
        </div>
        <div class="score">
            <h3>Bundle Size</h3>
            <div class="score-value ${this.getScoreClass(this.report.score.bundle)}">${this.report.score.bundle}</div>
        </div>
        <div class="score">
            <h3>Prerender Speed</h3>
            <div class="score-value ${this.getScoreClass(this.report.score.prerender)}">${this.report.score.prerender}</div>
        </div>
    </div>

    ${this.report.recommendations.length > 0 ? `
    <div class="section">
        <h2>📋 Recommendations</h2>
        ${this.report.recommendations.map(rec => `
            <div class="recommendation ${rec.severity}">
                <h4>${rec.category}</h4>
                <p><strong>Issue:</strong> ${rec.issue}</p>
                <p><strong>Recommendation:</strong> ${rec.recommendation}</p>
                ${rec.details ? `<pre>${rec.details.join('\\n')}</pre>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${this.report.buildMetrics ? `
    <div class="section">
        <h2>⚡ Build Metrics</h2>
        <table>
            <tr>
                <th>Phase</th>
                <th>Duration</th>
                <th>Memory Usage</th>
            </tr>
            ${Object.entries(this.report.buildMetrics.phases || {}).map(([phase, data]) => `
                <tr>
                    <td>${phase}</td>
                    <td>${(data.duration / 1000).toFixed(2)}s</td>
                    <td>${(data.memoryDelta?.heapUsed / 1024 / 1024).toFixed(2) || 'N/A'}MB</td>
                </tr>
            `).join('')}
        </table>
        
        <h3>Bundle Statistics</h3>
        <p>Total Size: ${(this.report.buildMetrics.bundleStats?.totalSize / 1024 / 1024).toFixed(2)}MB</p>
        <p>Total Files: ${this.report.buildMetrics.bundleStats?.totalFiles}</p>
    </div>
    ` : ''}

    ${this.report.prerenderMetrics ? `
    <div class="section">
        <h2>🎨 Prerender Metrics</h2>
        <p>Total Routes: ${this.report.prerenderMetrics.summary?.totalRoutes}</p>
        <p>Average Time per Route: ${this.report.prerenderMetrics.summary?.avgTimePerRoute?.toFixed(2)}ms</p>
        <p>Memory Growth: ${(this.report.prerenderMetrics.summary?.memoryGrowth / 1024 / 1024).toFixed(2)}MB</p>
        
        ${this.report.prerenderMetrics.summary?.slowestRoutes ? `
        <h3>Slowest Routes</h3>
        <table>
            <tr>
                <th>Route</th>
                <th>Duration</th>
                <th>Size</th>
            </tr>
            ${this.report.prerenderMetrics.summary.slowestRoutes.slice(0, 10).map(route => `
                <tr>
                    <td>${route.route}</td>
                    <td>${route.duration.toFixed(2)}ms</td>
                    <td>${(route.size / 1024).toFixed(2)}KB</td>
                </tr>
            `).join('')}
        </table>
        ` : ''}
    </div>
    ` : ''}
</body>
</html>`;

        await fs.writeFile(path.join(rootDir, 'build-performance-report.html'), html);
    }

    getScoreClass(score) {
        if (score >= 80) return 'score-good';
        if (score >= 60) return 'score-warning';
        return 'score-bad';
    }

    async generate() {
        console.log('📊 Generating comprehensive performance report...\n');
        
        await this.loadMetrics();
        this.calculateScores();
        this.generateRecommendations();
        
        // Save JSON report
        await fs.writeFile(
            path.join(rootDir, 'performance-report.json'),
            JSON.stringify(this.report, null, 2)
        );
        
        // Generate HTML report
        await this.generateHTMLReport();
        
        // Console output
        console.log('Performance Scores:');
        console.log(`  Overall: ${this.report.score.overall}/100`);
        console.log(`  Build: ${this.report.score.build}/100`);
        console.log(`  Bundle: ${this.report.score.bundle}/100`);
        console.log(`  Prerender: ${this.report.score.prerender}/100`);
        
        if (this.report.recommendations.length > 0) {
            console.log('\nTop Recommendations:');
            this.report.recommendations
                .filter(r => r.severity === 'critical' || r.severity === 'high')
                .slice(0, 5)
                .forEach(rec => {
                    console.log(`\n  [${rec.severity.toUpperCase()}] ${rec.category}`);
                    console.log(`  Issue: ${rec.issue}`);
                    console.log(`  Fix: ${rec.recommendation}`);
                });
        }
        
        console.log('\n✅ Reports generated:');
        console.log('  - performance-report.json');
        console.log('  - build-performance-report.html');
    }
}

// Run report generation
const generator = new PerformanceReportGenerator();
generator.generate().catch(console.error);