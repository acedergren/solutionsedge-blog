import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class SecurityAnalyzer {
    constructor() {
        this.analysis = {
            timestamp: new Date().toISOString(),
            xssVulnerabilities: [],
            dataExposure: {
                sensitiveVariables: [],
                apiKeys: [],
                environmentVars: []
            },
            inputSanitization: {
                unsafeInputs: [],
                missingSanitization: []
            },
            dependencies: {
                vulnerabilities: [],
                outdated: [],
                analyzed: false
            },
            authentication: {
                patterns: [],
                issues: []
            },
            dataHandling: {
                unsafeOperations: [],
                loggingIssues: []
            },
            clientSideSecurity: {
                localstorage: [],
                cookies: [],
                postMessage: []
            },
            recommendations: [],
            securityScore: 100
        };
    }

    async analyzeSecurityPatterns() {
        console.log('🛡️  Analyzing security patterns...');
        
        const srcDir = path.join(rootDir, 'src');
        await this.walkDirectory(srcDir);
        
        await this.analyzeDependencyVulnerabilities();
        this.generateSecurityRecommendations();
        this.calculateSecurityScore();
    }

    async walkDirectory(dir) {
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory() && !file.name.startsWith('.')) {
                    await this.walkDirectory(fullPath);
                } else if (this.isAnalyzableFile(file.name)) {
                    await this.analyzeFile(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error walking directory ${dir}:`, error);
        }
    }

    isAnalyzableFile(filename) {
        return filename.endsWith('.ts') || 
               filename.endsWith('.js') || 
               filename.endsWith('.svelte') ||
               filename.endsWith('.html');
    }

    async analyzeFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath);
        
        this.analyzeXSSVulnerabilities(content, relativePath);
        this.analyzeSensitiveDataExposure(content, relativePath);
        this.analyzeInputSanitization(content, relativePath);
        this.analyzeAuthenticationPatterns(content, relativePath);
        this.analyzeClientSideSecurity(content, relativePath);
        this.analyzeDataHandling(content, relativePath);
    }

    analyzeXSSVulnerabilities(content, filePath) {
        // innerHTML usage without sanitization
        const innerHTMLMatches = content.matchAll(/\.innerHTML\s*=\s*([^;]+)/g);
        for (const match of innerHTMLMatches) {
            const assignment = match[1];
            
            // Check if the assignment involves user input or variables
            if (!assignment.includes('sanitize') && 
                !assignment.includes('escape') &&
                !assignment.includes('DOMPurify') &&
                (assignment.includes('+') || assignment.includes('${') || assignment.includes('`'))) {
                
                this.analysis.xssVulnerabilities.push({
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    type: 'innerHTML_without_sanitization',
                    context: match[0],
                    severity: 'high'
                });
            }
        }

        // Svelte HTML insertion
        const svelteHTMLMatches = content.matchAll(/{@html\s+([^}]+)}/g);
        for (const match of svelteHTMLMatches) {
            const expression = match[1];
            
            if (!expression.includes('sanitize') && 
                !expression.includes('escape') &&
                !expression.includes('DOMPurify')) {
                
                this.analysis.xssVulnerabilities.push({
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    type: 'svelte_html_without_sanitization',
                    context: match[0],
                    severity: 'high'
                });
            }
        }

        // JavaScript URL schemes
        const jsURLMatches = content.matchAll(/(?:href|src)\s*=\s*["']javascript:/gi);
        for (const match of jsURLMatches) {
            this.analysis.xssVulnerabilities.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                type: 'javascript_url_scheme',
                context: match[0],
                severity: 'medium'
            });
        }

        // document.write usage
        const documentWriteMatches = content.matchAll(/document\.write\s*\(/g);
        for (const match of documentWriteMatches) {
            this.analysis.xssVulnerabilities.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                type: 'document_write_usage',
                context: match[0],
                severity: 'medium'
            });
        }
    }

    analyzeSensitiveDataExposure(content, filePath) {
        // API keys and tokens
        const apiKeyPatterns = [
            /(?:api[_-]?key|apikey)\s*[:=]\s*["']([^"']+)["']/gi,
            /(?:secret|token|password)\s*[:=]\s*["']([^"']+)["']/gi,
            /(?:bearer|auth)[_-]?token\s*[:=]\s*["']([^"']+)["']/gi
        ];

        for (const pattern of apiKeyPatterns) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                // Skip if it's clearly a placeholder or example
                const value = match[1];
                if (!value.includes('xxx') && 
                    !value.includes('placeholder') && 
                    !value.includes('example') &&
                    value.length > 8) {
                    
                    this.analysis.dataExposure.apiKeys.push({
                        file: filePath,
                        line: content.substring(0, match.index).split('\n').length,
                        type: 'hardcoded_secret',
                        severity: 'critical'
                    });
                }
            }
        }

        // Environment variable usage patterns
        const envMatches = content.matchAll(/process\.env\.([A-Z_]+)/g);
        for (const match of envMatches) {
            this.analysis.dataExposure.environmentVars.push({
                file: filePath,
                variable: match[1],
                line: content.substring(0, match.index).split('\n').length
            });
        }

        // Console logging of potentially sensitive data
        const consoleMatches = content.matchAll(/console\.(log|info|debug|warn|error)\s*\([^)]*(?:password|token|key|secret)[^)]*\)/gi);
        for (const match of consoleMatches) {
            this.analysis.dataHandling.loggingIssues.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                type: 'sensitive_data_logging',
                context: match[0],
                severity: 'medium'
            });
        }
    }

    analyzeInputSanitization(content, filePath) {
        // Form inputs without validation
        const inputMatches = content.matchAll(/<input[^>]*>/gi);
        for (const match of inputMatches) {
            const inputTag = match[0];
            
            // Check for missing validation attributes
            if (!inputTag.includes('pattern=') && 
                !inputTag.includes('required') &&
                !inputTag.includes('maxlength=') &&
                inputTag.includes('type="text"') || !inputTag.includes('type=')) {
                
                this.analysis.inputSanitization.unsafeInputs.push({
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    type: 'unvalidated_text_input',
                    severity: 'medium'
                });
            }
        }

        // Direct user input usage without sanitization
        const userInputPatterns = [
            /\.value\s*[^;]*(?!(?:sanitize|escape|validate))/g,
            /params\.\w+\s*[^;]*(?!(?:sanitize|escape|validate))/g,
            /searchParams\.get\([^)]+\)[^;]*(?!(?:sanitize|escape|validate))/g
        ];

        for (const pattern of userInputPatterns) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                // Skip if it's clearly being validated
                const context = content.substring(match.index - 50, match.index + 100);
                if (!context.includes('sanitize') && 
                    !context.includes('validate') && 
                    !context.includes('escape')) {
                    
                    this.analysis.inputSanitization.missingSanitization.push({
                        file: filePath,
                        line: content.substring(0, match.index).split('\n').length,
                        type: 'unsanitized_user_input',
                        context: match[0],
                        severity: 'high'
                    });
                }
            }
        }
    }

    analyzeAuthenticationPatterns(content, filePath) {
        // Basic auth patterns
        const authPatterns = [
            /(?:basic|bearer)\s+auth/gi,
            /authorization\s*[:=]/gi,
            /\.setHeader\s*\(\s*["']authorization["']/gi
        ];

        for (const pattern of authPatterns) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                this.analysis.authentication.patterns.push({
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    type: 'auth_header_usage'
                });
            }
        }

        // Insecure authentication storage
        const insecureStorageMatches = content.matchAll(/localStorage\.setItem\s*\(\s*["'][^"']*(?:token|auth|password)[^"']*["']/gi);
        for (const match of insecureStorageMatches) {
            this.analysis.authentication.issues.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                type: 'token_in_localstorage',
                severity: 'medium',
                recommendation: 'Use httpOnly cookies or secure session storage'
            });
        }
    }

    analyzeClientSideSecurity(content, filePath) {
        // localStorage usage
        const localStorageMatches = content.matchAll(/localStorage\.(setItem|getItem)/g);
        for (const match of localStorageMatches) {
            this.analysis.clientSideSecurity.localstorage.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                operation: match[1]
            });
        }

        // Cookie manipulation
        const cookieMatches = content.matchAll(/document\.cookie\s*=/g);
        for (const match of cookieMatches) {
            this.analysis.clientSideSecurity.cookies.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                type: 'cookie_manipulation'
            });
        }

        // postMessage usage
        const postMessageMatches = content.matchAll(/\.postMessage\s*\(/g);
        for (const match of postMessageMatches) {
            // Check if origin is validated
            const context = content.substring(match.index - 100, match.index + 200);
            const hasOriginValidation = /origin\s*[!=]==/.test(context);
            
            this.analysis.clientSideSecurity.postMessage.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                hasOriginValidation,
                severity: hasOriginValidation ? 'low' : 'high'
            });
        }
    }

    analyzeDataHandling(content, filePath) {
        // Unsafe JSON.parse usage
        const jsonParseMatches = content.matchAll(/JSON\.parse\s*\([^)]+\)/g);
        for (const match of jsonParseMatches) {
            // Check if it's wrapped in try-catch
            const context = content.substring(match.index - 100, match.index + 100);
            const hasTryCatch = context.includes('try') || context.includes('catch');
            
            if (!hasTryCatch) {
                this.analysis.dataHandling.unsafeOperations.push({
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    type: 'json_parse_without_error_handling',
                    severity: 'medium'
                });
            }
        }

        // eval() usage
        const evalMatches = content.matchAll(/\beval\s*\(/g);
        for (const match of evalMatches) {
            this.analysis.dataHandling.unsafeOperations.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                type: 'eval_usage',
                severity: 'critical'
            });
        }

        // Function constructor
        const functionConstructorMatches = content.matchAll(/new\s+Function\s*\(/g);
        for (const match of functionConstructorMatches) {
            this.analysis.dataHandling.unsafeOperations.push({
                file: filePath,
                line: content.substring(0, match.index).split('\n').length,
                type: 'function_constructor',
                severity: 'high'
            });
        }
    }

    async analyzeDependencyVulnerabilities() {
        try {
            console.log('🔍 Checking dependency vulnerabilities...');
            
            // Run npm audit
            const { stdout, stderr } = await execAsync('npm audit --json', { 
                cwd: rootDir,
                timeout: 30000 
            });
            
            if (stdout) {
                const auditResult = JSON.parse(stdout);
                
                if (auditResult.vulnerabilities) {
                    for (const [packageName, vuln] of Object.entries(auditResult.vulnerabilities)) {
                        this.analysis.dependencies.vulnerabilities.push({
                            package: packageName,
                            severity: vuln.severity,
                            via: vuln.via,
                            fixAvailable: vuln.fixAvailable
                        });
                    }
                }
                
                this.analysis.dependencies.analyzed = true;
            }
        } catch (error) {
            console.warn('Could not run npm audit:', error.message);
        }
    }

    generateSecurityRecommendations() {
        const recommendations = [];

        // XSS vulnerabilities
        if (this.analysis.xssVulnerabilities.length > 0) {
            recommendations.push({
                category: 'XSS Prevention',
                priority: 'critical',
                count: this.analysis.xssVulnerabilities.length,
                recommendation: 'Sanitize all user input before rendering HTML. Use DOMPurify or similar libraries.'
            });
        }

        // Sensitive data exposure
        if (this.analysis.dataExposure.apiKeys.length > 0) {
            recommendations.push({
                category: 'Data Exposure',
                priority: 'critical',
                count: this.analysis.dataExposure.apiKeys.length,
                recommendation: 'Remove hardcoded API keys and secrets. Use environment variables.'
            });
        }

        // Input sanitization
        if (this.analysis.inputSanitization.missingSanitization.length > 0) {
            recommendations.push({
                category: 'Input Validation',
                priority: 'high',
                count: this.analysis.inputSanitization.missingSanitization.length,
                recommendation: 'Implement proper input validation and sanitization for all user inputs.'
            });
        }

        // Authentication issues
        if (this.analysis.authentication.issues.length > 0) {
            recommendations.push({
                category: 'Authentication Security',
                priority: 'high',
                count: this.analysis.authentication.issues.length,
                recommendation: 'Use secure storage methods for authentication tokens (httpOnly cookies).'
            });
        }

        // Unsafe operations
        if (this.analysis.dataHandling.unsafeOperations.length > 0) {
            recommendations.push({
                category: 'Code Safety',
                priority: 'critical',
                count: this.analysis.dataHandling.unsafeOperations.length,
                recommendation: 'Remove or secure unsafe operations like eval() and unprotected JSON.parse().'
            });
        }

        // Dependency vulnerabilities
        if (this.analysis.dependencies.vulnerabilities.length > 0) {
            const criticalVulns = this.analysis.dependencies.vulnerabilities
                .filter(v => v.severity === 'critical' || v.severity === 'high').length;
            
            recommendations.push({
                category: 'Dependency Security',
                priority: criticalVulns > 0 ? 'critical' : 'medium',
                count: this.analysis.dependencies.vulnerabilities.length,
                recommendation: 'Update dependencies to fix security vulnerabilities. Run npm audit fix.'
            });
        }

        // postMessage without origin validation
        const unsafePostMessages = this.analysis.clientSideSecurity.postMessage
            .filter(pm => !pm.hasOriginValidation);
        if (unsafePostMessages.length > 0) {
            recommendations.push({
                category: 'Cross-Origin Security',
                priority: 'high',
                count: unsafePostMessages.length,
                recommendation: 'Always validate message origin in postMessage event handlers.'
            });
        }

        this.analysis.recommendations = recommendations;
    }

    calculateSecurityScore() {
        let score = 100;

        // Deduct for critical issues
        score -= this.analysis.xssVulnerabilities.length * 15;
        score -= this.analysis.dataExposure.apiKeys.length * 20;
        score -= this.analysis.dataHandling.unsafeOperations
            .filter(op => op.severity === 'critical').length * 25;

        // Deduct for high severity issues
        score -= this.analysis.inputSanitization.missingSanitization.length * 10;
        score -= this.analysis.authentication.issues.length * 10;
        score -= this.analysis.dependencies.vulnerabilities
            .filter(v => v.severity === 'high' || v.severity === 'critical').length * 5;

        // Deduct for medium severity issues
        score -= this.analysis.dataHandling.loggingIssues.length * 5;
        score -= this.analysis.inputSanitization.unsafeInputs.length * 3;

        this.analysis.securityScore = Math.max(0, score);
    }

    async generateReport() {
        await this.analyzeSecurityPatterns();
        
        const reportPath = path.join(rootDir, 'security-analysis-report.json');
        await fs.writeFile(reportPath, JSON.stringify(this.analysis, null, 2));
        
        this.printSummary();
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
        return this.analysis;
    }

    printSummary() {
        console.log('\n🛡️  Security Analysis Summary');
        console.log('=' . repeat(60));
        
        console.log(`\n🚨 Vulnerabilities:`);
        console.log(`   XSS Vulnerabilities: ${this.analysis.xssVulnerabilities.length}`);
        console.log(`   Hardcoded Secrets: ${this.analysis.dataExposure.apiKeys.length}`);
        console.log(`   Unsafe Operations: ${this.analysis.dataHandling.unsafeOperations.length}`);
        
        console.log(`\n🔐 Input Security:`);
        console.log(`   Unvalidated Inputs: ${this.analysis.inputSanitization.unsafeInputs.length}`);
        console.log(`   Missing Sanitization: ${this.analysis.inputSanitization.missingSanitization.length}`);
        
        console.log(`\n🔑 Authentication:`);
        console.log(`   Auth Patterns Found: ${this.analysis.authentication.patterns.length}`);
        console.log(`   Security Issues: ${this.analysis.authentication.issues.length}`);
        
        console.log(`\n📦 Dependencies:`);
        if (this.analysis.dependencies.analyzed) {
            console.log(`   Vulnerabilities: ${this.analysis.dependencies.vulnerabilities.length}`);
            const critical = this.analysis.dependencies.vulnerabilities
                .filter(v => v.severity === 'critical').length;
            const high = this.analysis.dependencies.vulnerabilities
                .filter(v => v.severity === 'high').length;
            if (critical > 0) console.log(`   Critical: ${critical}`);
            if (high > 0) console.log(`   High: ${high}`);
        } else {
            console.log(`   Analysis Failed: Could not run npm audit`);
        }
        
        console.log(`\n💾 Client-Side Security:`);
        console.log(`   localStorage Usage: ${this.analysis.clientSideSecurity.localstorage.length}`);
        console.log(`   postMessage Calls: ${this.analysis.clientSideSecurity.postMessage.length}`);
        const unsafePostMessage = this.analysis.clientSideSecurity.postMessage
            .filter(pm => !pm.hasOriginValidation).length;
        if (unsafePostMessage > 0) {
            console.log(`   Unsafe postMessage: ${unsafePostMessage}`);
        }
        
        console.log(`\n📊 Security Score: ${this.analysis.securityScore}/100`);
        
        if (this.analysis.recommendations.length > 0) {
            console.log(`\n💡 Priority Recommendations:`);
            const criticalRecs = this.analysis.recommendations
                .filter(r => r.priority === 'critical');
            const highRecs = this.analysis.recommendations
                .filter(r => r.priority === 'high');
            
            for (const rec of [...criticalRecs, ...highRecs].slice(0, 5)) {
                console.log(`   [${rec.priority.toUpperCase()}] ${rec.category}: ${rec.recommendation}`);
            }
        }
    }
}

// Run analysis
const analyzer = new SecurityAnalyzer();
analyzer.generateReport().catch(console.error);