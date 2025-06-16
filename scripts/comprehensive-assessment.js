import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class ComprehensiveAssessment {
    constructor() {
        this.assessment = {
            timestamp: new Date().toISOString(),
            overview: {
                projectName: 'SolutionsEdge Blog',
                framework: 'SvelteKit',
                language: 'TypeScript',
                assessmentVersion: '1.0.0'
            },
            scores: {
                architecture: 0,
                codeQuality: 0,
                typeSafety: 0,
                security: 0,
                performance: 0,
                overall: 0
            },
            findings: {
                critical: [],
                high: [],
                medium: [],
                low: []
            },
            strengths: [],
            recommendations: {
                immediate: [],
                shortTerm: [],
                longTerm: []
            },
            technicalDebt: {
                score: 0,
                categories: []
            },
            maintainability: {
                score: 0,
                factors: []
            }
        };
    }

    async loadAnalysisReports() {
        const reports = {};
        
        // Load all available reports
        const reportFiles = [
            'architectural-analysis-report.json',
            'code-quality-report.json',
            'typescript-safety-report.json',
            'security-analysis-report.json',
            'tree-shaking-report.json',
            'build-performance-report.json'
        ];

        for (const file of reportFiles) {
            try {
                const filePath = path.join(rootDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const reportName = file.replace('-report.json', '').replace(/-/g, '_');
                reports[reportName] = JSON.parse(content);
            } catch (error) {
                console.warn(`Could not load ${file}:`, error.message);
            }
        }

        return reports;
    }

    analyzeArchitecturalIntegrity(reports) {
        const arch = reports.architectural_analysis;
        if (!arch) return 0;

        let score = 100;
        
        // Component architecture assessment
        const reusabilityScore = arch.componentArchitecture?.reusabilityScore || 0;
        score = (score + reusabilityScore) / 2;
        
        // Deduct for prop drilling
        const propDrillingIssues = arch.componentArchitecture?.propDrilling?.length || 0;
        score -= propDrillingIssues * 15;
        
        // Deduct for routing complexity
        const routingComplexity = arch.routingArchitecture?.complexity || 0;
        if (routingComplexity > 30) score -= 20;
        if (routingComplexity > 50) score -= 30;
        
        // Store management
        const storeIssues = arch.storeManagement?.issues?.length || 0;
        score -= storeIssues * 10;
        
        this.assessment.scores.architecture = Math.max(0, score);
        
        // Add findings
        if (propDrillingIssues > 0) {
            this.assessment.findings.medium.push({
                category: 'Architecture',
                issue: `${propDrillingIssues} components have potential prop drilling`,
                impact: 'Reduced maintainability and component reusability'
            });
        }
        
        if (routingComplexity > 40) {
            this.assessment.findings.high.push({
                category: 'Architecture',
                issue: `High routing complexity (${routingComplexity.toFixed(1)})`,
                impact: 'Difficult navigation management and potential performance issues'
            });
        }
        
        // Strengths
        if (reusabilityScore > 60) {
            this.assessment.strengths.push('Good component composition and reusability patterns');
        }
        
        return this.assessment.scores.architecture;
    }

    analyzeCodeQuality(reports) {
        const quality = reports.code_quality;
        if (!quality) return 0;

        let score = 100;
        
        // Complexity metrics
        const avgComplexity = quality.complexity?.average || 0;
        if (avgComplexity > 10) score -= 15;
        if (avgComplexity > 15) score -= 25;
        if (avgComplexity > 20) score -= 35;
        
        // Function quality
        const oversizedFunctions = quality.functions?.oversized?.length || 0;
        score -= oversizedFunctions * 10;
        
        const excessiveParams = quality.functions?.parameters?.excessive?.length || 0;
        score -= excessiveParams * 5;
        
        // Technical debt
        const debtScore = quality.technicalDebt?.score || 100;
        score = (score + debtScore) / 2;
        
        // Naming consistency
        const inconsistentNames = quality.naming?.conventions?.inconsistent?.length || 0;
        score -= inconsistentNames * 2;
        
        this.assessment.scores.codeQuality = Math.max(0, score);
        this.assessment.technicalDebt.score = debtScore;
        
        // Add findings based on quality metrics
        if (avgComplexity > 15) {
            this.assessment.findings.high.push({
                category: 'Code Quality',
                issue: `High average cyclomatic complexity (${avgComplexity.toFixed(2)})`,
                impact: 'Increased maintenance burden and bug risk',
                location: `Highest in: ${quality.complexity?.highest?.file}`
            });
        }
        
        if (oversizedFunctions > 0) {
            this.assessment.findings.medium.push({
                category: 'Code Quality',
                issue: `${oversizedFunctions} functions exceed size recommendations`,
                impact: 'Reduced readability and testability'
            });
        }
        
        // Technical debt categories
        const todoCount = quality.technicalDebt?.todos?.length || 0;
        if (todoCount > 0) {
            this.assessment.technicalDebt.categories.push({
                type: 'TODO Comments',
                count: todoCount,
                severity: todoCount > 10 ? 'high' : 'medium'
            });
        }
        
        return this.assessment.scores.codeQuality;
    }

    analyzeTypeSafety(reports) {
        const ts = reports.typescript_safety;
        if (!ts) return 0;

        let score = 100;
        
        // Strict mode compliance
        if (!ts.strictMode?.enabled) score -= 30;
        score -= (ts.strictMode?.violations?.length || 0) * 5;
        
        // Type coverage
        const typeCoverage = ts.typeCoverage?.percentage || 0;
        score = (score + typeCoverage) / 2;
        
        // Any usage penalty
        const anyUsage = ts.typeCoverage?.anyUsage?.length || 0;
        score -= anyUsage * 3;
        
        // Error handling
        const asyncOps = ts.errorHandling?.asyncOperations?.total || 0;
        const handledOps = ts.errorHandling?.asyncOperations?.withErrorHandling || 0;
        if (asyncOps > 0) {
            const errorHandlingRatio = handledOps / asyncOps;
            score = score * errorHandlingRatio;
        }
        
        this.assessment.scores.typeSafety = Math.max(0, score);
        
        // Add findings
        if (typeCoverage < 80) {
            this.assessment.findings.high.push({
                category: 'Type Safety',
                issue: `Low TypeScript coverage (${typeCoverage.toFixed(1)}%)`,
                impact: 'Increased runtime error risk and reduced developer experience'
            });
        }
        
        if (anyUsage > 5) {
            this.assessment.findings.medium.push({
                category: 'Type Safety',
                issue: `${anyUsage} usages of 'any' type`,
                impact: 'Bypassed type checking and potential runtime errors'
            });
        }
        
        const missingErrorHandling = ts.errorHandling?.asyncOperations?.missingErrorHandling?.length || 0;
        if (missingErrorHandling > 0) {
            this.assessment.findings.high.push({
                category: 'Error Handling',
                issue: `${missingErrorHandling} async operations without error handling`,
                impact: 'Potential unhandled promise rejections and poor user experience'
            });
        }
        
        return this.assessment.scores.typeSafety;
    }

    analyzeSecurity(reports) {
        const security = reports.security_analysis;
        if (!security) return 0;

        const securityScore = security.securityScore || 0;
        this.assessment.scores.security = securityScore;
        
        // Add critical security findings
        const xssVulns = security.xssVulnerabilities?.length || 0;
        if (xssVulns > 0) {
            this.assessment.findings.critical.push({
                category: 'Security',
                issue: `${xssVulns} potential XSS vulnerabilities`,
                impact: 'User data exposure and potential account compromise'
            });
        }
        
        const hardcodedSecrets = security.dataExposure?.apiKeys?.length || 0;
        if (hardcodedSecrets > 0) {
            this.assessment.findings.critical.push({
                category: 'Security',
                issue: `${hardcodedSecrets} hardcoded secrets detected`,
                impact: 'Credential exposure and unauthorized access risk'
            });
        }
        
        const unsafeOps = security.dataHandling?.unsafeOperations?.length || 0;
        if (unsafeOps > 0) {
            this.assessment.findings.critical.push({
                category: 'Security',
                issue: `${unsafeOps} unsafe code operations`,
                impact: 'Code injection and execution vulnerabilities'
            });
        }
        
        const inputIssues = security.inputSanitization?.missingSanitization?.length || 0;
        if (inputIssues > 0) {
            this.assessment.findings.high.push({
                category: 'Security',
                issue: `${inputIssues} inputs without proper sanitization`,
                impact: 'Input validation bypass and injection attacks'
            });
        }
        
        return this.assessment.scores.security;
    }

    analyzePerformance(reports) {
        const perf = reports.build_performance;
        if (!perf) return 50; // Default score if no performance data

        let score = 100;
        
        // Build time assessment
        const buildTime = perf.totalBuildTime || 30000; // Default 30s
        if (buildTime > 60000) score -= 20;
        if (buildTime > 120000) score -= 40;
        if (buildTime > 300000) score -= 60;
        
        // Bundle size assessment
        const bundleSize = perf.bundleStats?.totalSize || 0;
        const bundleSizeMB = bundleSize / (1024 * 1024);
        if (bundleSizeMB > 5) score -= 15;
        if (bundleSizeMB > 10) score -= 30;
        if (bundleSizeMB > 20) score -= 50;
        
        // Code efficiency
        const jsSize = perf.bundleStats?.filesByType?.['.js']?.size || 0;
        const jsSizeMB = jsSize / (1024 * 1024);
        if (jsSizeMB > 2) score -= 10;
        if (jsSizeMB > 5) score -= 25;
        
        this.assessment.scores.performance = Math.max(0, score);
        
        // Add performance findings
        if (buildTime > 90000) {
            this.assessment.findings.medium.push({
                category: 'Performance',
                issue: `Slow build time (${(buildTime / 1000).toFixed(1)}s)`,
                impact: 'Reduced developer productivity and deployment speed'
            });
        }
        
        if (bundleSizeMB > 10) {
            this.assessment.findings.high.push({
                category: 'Performance',
                issue: `Large bundle size (${bundleSizeMB.toFixed(2)}MB)`,
                impact: 'Slow page load times and poor user experience'
            });
        }
        
        // Strengths
        if (jsSizeMB < 1) {
            this.assessment.strengths.push('Excellent JavaScript bundle optimization');
        }
        
        return this.assessment.scores.performance;
    }

    generateRecommendations() {
        // Immediate actions (critical issues)
        const criticalIssues = this.assessment.findings.critical;
        for (const issue of criticalIssues) {
            this.assessment.recommendations.immediate.push({
                priority: 'CRITICAL',
                action: `Fix ${issue.issue.toLowerCase()}`,
                reason: issue.impact,
                category: issue.category
            });
        }
        
        // Short-term improvements (high priority)
        const highIssues = this.assessment.findings.high;
        for (const issue of highIssues.slice(0, 5)) {
            this.assessment.recommendations.shortTerm.push({
                priority: 'HIGH',
                action: `Address ${issue.issue.toLowerCase()}`,
                reason: issue.impact,
                category: issue.category
            });
        }
        
        // Long-term improvements
        if (this.assessment.scores.architecture < 80) {
            this.assessment.recommendations.longTerm.push({
                priority: 'MEDIUM',
                action: 'Refactor component architecture for better composition',
                reason: 'Improve maintainability and code reuse',
                category: 'Architecture'
            });
        }
        
        if (this.assessment.scores.typeSafety < 85) {
            this.assessment.recommendations.longTerm.push({
                priority: 'MEDIUM',
                action: 'Increase TypeScript coverage and eliminate any types',
                reason: 'Better development experience and runtime safety',
                category: 'Type Safety'
            });
        }
        
        if (this.assessment.technicalDebt.score < 80) {
            this.assessment.recommendations.longTerm.push({
                priority: 'LOW',
                action: 'Establish technical debt reduction plan',
                reason: 'Prevent accumulation of maintenance burden',
                category: 'Technical Debt'
            });
        }
    }

    calculateOverallScore() {
        const scores = this.assessment.scores;
        const weights = {
            security: 0.25,      // Highest weight - security is critical
            typeSafety: 0.20,    // Type safety prevents many issues
            codeQuality: 0.20,   // Code quality affects maintainability
            architecture: 0.20,  // Architecture affects scalability
            performance: 0.15    // Performance is important but can be optimized later
        };
        
        const weightedScore = 
            scores.security * weights.security +
            scores.typeSafety * weights.typeSafety +
            scores.codeQuality * weights.codeQuality +
            scores.architecture * weights.architecture +
            scores.performance * weights.performance;
        
        this.assessment.scores.overall = Math.round(weightedScore);
        
        // Maintainability calculation
        this.assessment.maintainability.score = Math.round(
            (scores.architecture + scores.codeQuality + scores.typeSafety) / 3
        );
        
        this.assessment.maintainability.factors = [
            { factor: 'Code Quality', score: scores.codeQuality },
            { factor: 'Architecture', score: scores.architecture },
            { factor: 'Type Safety', score: scores.typeSafety },
            { factor: 'Technical Debt', score: this.assessment.technicalDebt.score }
        ];
    }

    async generateReport() {
        console.log('📊 Generating comprehensive assessment...\n');
        
        const reports = await this.loadAnalysisReports();
        
        // Analyze each area
        this.analyzeArchitecturalIntegrity(reports);
        this.analyzeCodeQuality(reports);
        this.analyzeTypeSafety(reports);
        this.analyzeSecurity(reports);
        this.analyzePerformance(reports);
        
        // Generate recommendations and calculate overall score
        this.generateRecommendations();
        this.calculateOverallScore();
        
        // Save comprehensive report
        const reportPath = path.join(rootDir, 'comprehensive-assessment-report.json');
        await fs.writeFile(reportPath, JSON.stringify(this.assessment, null, 2));
        
        // Generate HTML report
        await this.generateHTMLReport();
        
        this.printExecutiveSummary();
        
        console.log(`\n📄 Reports generated:`);
        console.log(`   - ${reportPath}`);
        console.log(`   - ${path.join(rootDir, 'comprehensive-assessment.html')}`);
        
        return this.assessment;
    }

    async generateHTMLReport() {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprehensive Code Assessment - SolutionsEdge Blog</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f7fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .score-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-left: 4px solid;
        }
        .score-card.excellent { border-left-color: #10b981; }
        .score-card.good { border-left-color: #3b82f6; }
        .score-card.warning { border-left-color: #f59e0b; }
        .score-card.danger { border-left-color: #ef4444; }
        .score-value {
            font-size: 3em;
            font-weight: bold;
            margin: 10px 0;
        }
        .score-excellent { color: #10b981; }
        .score-good { color: #3b82f6; }
        .score-warning { color: #f59e0b; }
        .score-danger { color: #ef4444; }
        .section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .finding {
            padding: 15px;
            margin: 10px 0;
            border-left: 4px solid;
            border-radius: 0 8px 8px 0;
        }
        .finding.critical {
            background: #fef2f2;
            border-left-color: #dc2626;
        }
        .finding.high {
            background: #fef3c7;
            border-left-color: #d97706;
        }
        .finding.medium {
            background: #dbeafe;
            border-left-color: #2563eb;
        }
        .finding.low {
            background: #f0fdf4;
            border-left-color: #16a34a;
        }
        .strengths {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .recommendation {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }
        .priority-critical { border-left: 4px solid #dc2626; }
        .priority-high { border-left: 4px solid #ea580c; }
        .priority-medium { border-left: 4px solid #ca8a04; }
        .priority-low { border-left: 4px solid #16a34a; }
        .progress-bar {
            background: #e5e7eb;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            margin: 10px 0;
        }
        .progress-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        .progress-excellent { background: linear-gradient(90deg, #10b981, #059669); }
        .progress-good { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
        .progress-warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .progress-danger { background: linear-gradient(90deg, #ef4444, #dc2626); }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏗️ Comprehensive Code Assessment</h1>
        <p>SolutionsEdge Blog - Generated ${this.assessment.timestamp}</p>
        <h2>Overall Score: ${this.assessment.scores.overall}/100</h2>
    </div>

    <div class="score-grid">
        ${this.generateScoreCards()}
    </div>

    <div class="section">
        <h2>📈 Score Breakdown</h2>
        ${this.generateProgressBars()}
    </div>

    ${this.assessment.findings.critical.length > 0 ? `
    <div class="section">
        <h2>🚨 Critical Issues</h2>
        ${this.assessment.findings.critical.map(f => `
            <div class="finding critical">
                <strong>${f.category}:</strong> ${f.issue}<br>
                <small><strong>Impact:</strong> ${f.impact}</small>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${this.assessment.findings.high.length > 0 ? `
    <div class="section">
        <h2>⚠️ High Priority Issues</h2>
        ${this.assessment.findings.high.map(f => `
            <div class="finding high">
                <strong>${f.category}:</strong> ${f.issue}<br>
                <small><strong>Impact:</strong> ${f.impact}</small>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${this.assessment.strengths.length > 0 ? `
    <div class="section">
        <h2>✅ Strengths</h2>
        <div class="strengths">
            <ul>
                ${this.assessment.strengths.map(s => `<li>${s}</li>`).join('')}
            </ul>
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>🎯 Recommendations</h2>
        
        ${this.assessment.recommendations.immediate.length > 0 ? `
        <h3>Immediate Actions</h3>
        ${this.assessment.recommendations.immediate.map(r => `
            <div class="recommendation priority-critical">
                <strong>[${r.priority}]</strong> ${r.action}<br>
                <small><strong>Reason:</strong> ${r.reason}</small>
            </div>
        `).join('')}
        ` : ''}

        ${this.assessment.recommendations.shortTerm.length > 0 ? `
        <h3>Short-term Improvements</h3>
        ${this.assessment.recommendations.shortTerm.map(r => `
            <div class="recommendation priority-high">
                <strong>[${r.priority}]</strong> ${r.action}<br>
                <small><strong>Reason:</strong> ${r.reason}</small>
            </div>
        `).join('')}
        ` : ''}

        ${this.assessment.recommendations.longTerm.length > 0 ? `
        <h3>Long-term Strategy</h3>
        ${this.assessment.recommendations.longTerm.map(r => `
            <div class="recommendation priority-medium">
                <strong>[${r.priority}]</strong> ${r.action}<br>
                <small><strong>Reason:</strong> ${r.reason}</small>
            </div>
        `).join('')}
        ` : ''}
    </div>

    <div class="section">
        <h2>🔧 Maintainability Analysis</h2>
        <p><strong>Maintainability Score:</strong> ${this.assessment.maintainability.score}/100</p>
        <p><strong>Technical Debt Score:</strong> ${this.assessment.technicalDebt.score}/100</p>
        
        <h3>Contributing Factors:</h3>
        ${this.assessment.maintainability.factors.map(f => `
            <div style="margin: 10px 0;">
                <strong>${f.factor}:</strong> ${f.score}/100
                <div class="progress-bar">
                    <div class="progress-fill ${this.getProgressClass(f.score)}" style="width: ${f.score}%"></div>
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

        await fs.writeFile(path.join(rootDir, 'comprehensive-assessment.html'), html);
    }

    generateScoreCards() {
        const scores = this.assessment.scores;
        const cards = [
            { name: 'Overall', score: scores.overall, icon: '🏆' },
            { name: 'Security', score: scores.security, icon: '🛡️' },
            { name: 'Type Safety', score: scores.typeSafety, icon: '🔒' },
            { name: 'Code Quality', score: scores.codeQuality, icon: '💎' },
            { name: 'Architecture', score: scores.architecture, icon: '🏗️' },
            { name: 'Performance', score: scores.performance, icon: '⚡' }
        ];

        return cards.map(card => `
            <div class="score-card ${this.getScoreClass(card.score)}">
                <div style="font-size: 2em;">${card.icon}</div>
                <h3>${card.name}</h3>
                <div class="score-value ${this.getScoreColorClass(card.score)}">${card.score}</div>
                <div>${this.getScoreLabel(card.score)}</div>
            </div>
        `).join('');
    }

    generateProgressBars() {
        const scores = this.assessment.scores;
        return Object.entries(scores)
            .filter(([key]) => key !== 'overall')
            .map(([key, score]) => `
                <div style="margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                        <span>${score}/100</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${this.getProgressClass(score)}" style="width: ${score}%"></div>
                    </div>
                </div>
            `).join('');
    }

    getScoreClass(score) {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 50) return 'warning';
        return 'danger';
    }

    getScoreColorClass(score) {
        if (score >= 85) return 'score-excellent';
        if (score >= 70) return 'score-good';
        if (score >= 50) return 'score-warning';
        return 'score-danger';
    }

    getProgressClass(score) {
        if (score >= 85) return 'progress-excellent';
        if (score >= 70) return 'progress-good';
        if (score >= 50) return 'progress-warning';
        return 'progress-danger';
    }

    getScoreLabel(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Satisfactory';
        if (score >= 50) return 'Needs Improvement';
        return 'Critical';
    }

    printExecutiveSummary() {
        console.log('🏆 COMPREHENSIVE ASSESSMENT SUMMARY');
        console.log('=' . repeat(60));
        
        console.log(`\n📊 Overall Score: ${this.assessment.scores.overall}/100 (${this.getScoreLabel(this.assessment.scores.overall)})`);
        
        console.log(`\n📈 Individual Scores:`);
        console.log(`   Security:     ${this.assessment.scores.security}/100`);
        console.log(`   Type Safety:  ${this.assessment.scores.typeSafety}/100`);
        console.log(`   Code Quality: ${this.assessment.scores.codeQuality}/100`);
        console.log(`   Architecture: ${this.assessment.scores.architecture}/100`);
        console.log(`   Performance:  ${this.assessment.scores.performance}/100`);
        
        console.log(`\n🔧 Maintainability: ${this.assessment.maintainability.score}/100`);
        console.log(`💸 Technical Debt: ${this.assessment.technicalDebt.score}/100`);
        
        if (this.assessment.findings.critical.length > 0) {
            console.log(`\n🚨 CRITICAL ISSUES: ${this.assessment.findings.critical.length}`);
            for (const issue of this.assessment.findings.critical) {
                console.log(`   • ${issue.category}: ${issue.issue}`);
            }
        }
        
        if (this.assessment.findings.high.length > 0) {
            console.log(`\n⚠️  HIGH PRIORITY: ${this.assessment.findings.high.length}`);
            for (const issue of this.assessment.findings.high.slice(0, 3)) {
                console.log(`   • ${issue.category}: ${issue.issue}`);
            }
            if (this.assessment.findings.high.length > 3) {
                console.log(`   • ... and ${this.assessment.findings.high.length - 3} more`);
            }
        }
        
        if (this.assessment.strengths.length > 0) {
            console.log(`\n✅ STRENGTHS:`);
            for (const strength of this.assessment.strengths) {
                console.log(`   • ${strength}`);
            }
        }
        
        console.log(`\n🎯 IMMEDIATE ACTIONS REQUIRED:`);
        if (this.assessment.recommendations.immediate.length > 0) {
            for (const rec of this.assessment.recommendations.immediate) {
                console.log(`   • ${rec.action}`);
            }
        } else {
            console.log(`   • No critical actions required`);
        }
        
        console.log(`\n📋 NEXT STEPS:`);
        const nextSteps = this.assessment.recommendations.shortTerm.slice(0, 3);
        if (nextSteps.length > 0) {
            for (const rec of nextSteps) {
                console.log(`   • ${rec.action}`);
            }
        } else {
            console.log(`   • Focus on long-term improvements`);
        }
    }
}

// Run comprehensive assessment
const assessment = new ComprehensiveAssessment();
assessment.generateReport().catch(console.error);