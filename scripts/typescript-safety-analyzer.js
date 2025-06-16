import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class TypeScriptSafetyAnalyzer {
    constructor() {
        this.analysis = {
            timestamp: new Date().toISOString(),
            strictMode: {
                enabled: false,
                violations: []
            },
            typeCoverage: {
                percentage: 0,
                untypedFiles: [],
                anyUsage: [],
                implicitAny: []
            },
            errorHandling: {
                asyncOperations: {
                    total: 0,
                    withErrorHandling: 0,
                    missingErrorHandling: []
                },
                trycatches: {
                    total: 0,
                    generic: [],
                    specific: []
                },
                errorBoundaries: {
                    present: false,
                    locations: []
                },
                gracefulDegradation: []
            },
            edgeCases: {
                networkFailures: [],
                malformedData: [],
                userInput: [],
                nullChecks: []
            },
            recommendations: []
        };
    }

    async analyzeTypeScript() {
        console.log('🔒 Analyzing TypeScript safety and error handling...');
        
        await this.checkStrictMode();
        await this.analyzeTypeCoverage();
        await this.analyzeErrorHandling();
        await this.analyzeEdgeCases();
        this.generateRecommendations();
    }

    async checkStrictMode() {
        try {
            const tsconfigPath = path.join(rootDir, 'tsconfig.json');
            const tsconfigContent = await fs.readFile(tsconfigPath, 'utf-8');
            const tsconfig = JSON.parse(tsconfigContent);
            
            const compilerOptions = tsconfig.compilerOptions || {};
            
            this.analysis.strictMode.enabled = compilerOptions.strict === true;
            
            // Check individual strict flags
            const strictFlags = [
                'noImplicitAny',
                'strictNullChecks',
                'strictFunctionTypes',
                'strictBindCallApply',
                'strictPropertyInitialization',
                'noImplicitReturns',
                'noImplicitThis'
            ];
            
            for (const flag of strictFlags) {
                if (compilerOptions[flag] === false) {
                    this.analysis.strictMode.violations.push(flag);
                }
            }
            
        } catch (error) {
            console.error('Error reading tsconfig.json:', error);
        }
    }

    async analyzeTypeCoverage() {
        const srcDir = path.join(rootDir, 'src');
        await this.walkDirectory(srcDir, this.analyzeFileTypeSafety.bind(this));
        
        // Calculate overall type coverage
        const totalFiles = this.analysis.typeCoverage.untypedFiles.length + 
                          this.analysis.typeCoverage.anyUsage.length;
        const typedFiles = Math.max(0, totalFiles - this.analysis.typeCoverage.anyUsage.length);
        
        this.analysis.typeCoverage.percentage = totalFiles > 0 ? 
            (typedFiles / totalFiles) * 100 : 100;
    }

    async analyzeFileTypeSafety(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath);
        
        // Extract TypeScript/JavaScript content
        let tsContent = content;
        if (filePath.endsWith('.svelte')) {
            const scriptMatch = content.match(/<script[^>]*lang=["']ts["'][^>]*>([\s\S]*?)<\/script>/);
            if (!scriptMatch) {
                // No TypeScript in this Svelte file
                this.analysis.typeCoverage.untypedFiles.push(relativePath);
                return;
            }
            tsContent = scriptMatch[1];
        }
        
        // Check for 'any' usage
        const anyMatches = tsContent.matchAll(/:\s*any\b|as\s+any\b|<any>/g);
        for (const match of anyMatches) {
            this.analysis.typeCoverage.anyUsage.push({
                file: relativePath,
                line: content.substring(0, match.index).split('\n').length,
                context: this.getLineContext(content, match.index)
            });
        }
        
        // Check for implicit any (basic heuristics)
        const implicitAnyPatterns = [
            /function\s+\w+\s*\([^)]*\)\s*{/g, // Functions without return types
            /const\s+\w+\s*=/g, // Variables without type annotations
            /let\s+\w+\s*=/g
        ];
        
        for (const pattern of implicitAnyPatterns) {
            const matches = tsContent.matchAll(pattern);
            for (const match of matches) {
                // Simple check - if it doesn't have type annotation
                if (!match[0].includes(':')) {
                    this.analysis.typeCoverage.implicitAny.push({
                        file: relativePath,
                        line: content.substring(0, match.index).split('\n').length,
                        pattern: match[0].trim()
                    });
                }
            }
        }
    }

    async analyzeErrorHandling() {
        const srcDir = path.join(rootDir, 'src');
        await this.walkDirectory(srcDir, this.analyzeFileErrorHandling.bind(this));
    }

    async analyzeFileErrorHandling(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath);
        
        // Extract JavaScript content for analysis
        let jsContent = content;
        if (filePath.endsWith('.svelte')) {
            const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
            jsContent = scriptMatch ? scriptMatch[1] : '';
        }
        
        // Analyze async operations
        this.analyzeAsyncErrorHandling(jsContent, relativePath);
        
        // Analyze try-catch blocks
        this.analyzeTryCatchBlocks(jsContent, relativePath);
        
        // Check for error boundaries (Svelte-specific)
        if (filePath.endsWith('.svelte')) {
            this.analyzeErrorBoundaries(content, relativePath);
        }
    }

    analyzeAsyncErrorHandling(content, filePath) {
        // Find async operations
        const asyncPatterns = [
            /await\s+fetch\(/g,
            /\.then\(/g,
            /\.catch\(/g,
            /async\s+function/g,
            /async\s+\(/g,
            /Promise\./g
        ];
        
        let asyncOperations = 0;
        let handledOperations = 0;
        
        for (const pattern of asyncPatterns) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                asyncOperations++;
                
                // Check if this operation has error handling
                const contextStart = Math.max(0, match.index - 200);
                const contextEnd = Math.min(content.length, match.index + 200);
                const context = content.substring(contextStart, contextEnd);
                
                if (context.includes('.catch(') || 
                    context.includes('try {') || 
                    context.includes('} catch')) {
                    handledOperations++;
                } else {
                    this.analysis.errorHandling.asyncOperations.missingErrorHandling.push({
                        file: filePath,
                        line: content.substring(0, match.index).split('\n').length,
                        operation: match[0]
                    });
                }
            }
        }
        
        this.analysis.errorHandling.asyncOperations.total += asyncOperations;
        this.analysis.errorHandling.asyncOperations.withErrorHandling += handledOperations;
    }

    analyzeTryCatchBlocks(content, filePath) {
        const tryCatchMatches = content.matchAll(/try\s*{[\s\S]*?}\s*catch\s*\(([^)]*)\)\s*{([\s\S]*?)}/g);
        
        for (const match of tryCatchMatches) {
            this.analysis.errorHandling.trycatches.total++;
            
            const errorParam = match[1].trim();
            const catchBody = match[2];
            
            // Check if it's a generic catch-all
            if (errorParam === 'error' || errorParam === 'e' || errorParam === 'err') {
                // Check if the catch block is meaningful
                if (catchBody.includes('console.log') || catchBody.includes('console.error')) {
                    this.analysis.errorHandling.trycatches.generic.push({
                        file: filePath,
                        line: content.substring(0, match.index).split('\n').length,
                        issue: 'Generic error handling with only console logging'
                    });
                }
            } else {
                this.analysis.errorHandling.trycatches.specific.push({
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    errorType: errorParam
                });
            }
        }
    }

    analyzeErrorBoundaries(content, filePath) {
        // Look for Svelte error handling patterns
        if (content.includes('onError') || content.includes('error:')) {
            this.analysis.errorHandling.errorBoundaries.present = true;
            this.analysis.errorHandling.errorBoundaries.locations.push({
                file: filePath,
                type: 'svelte_error_handler'
            });
        }
        
        // Check for graceful degradation
        if (content.includes('{#if error}') || content.includes('{#if loading}')) {
            this.analysis.errorHandling.gracefulDegradation.push({
                file: filePath,
                pattern: 'conditional_rendering'
            });
        }
    }

    async analyzeEdgeCases() {
        const srcDir = path.join(rootDir, 'src');
        await this.walkDirectory(srcDir, this.analyzeFileEdgeCases.bind(this));
    }

    async analyzeFileEdgeCases(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath);
        
        // Network failure handling
        if (content.includes('fetch(') || content.includes('XMLHttpRequest')) {
            const hasNetworkErrorHandling = content.includes('NetworkError') || 
                                           content.includes('offline') ||
                                           content.includes('navigator.onLine');
            
            if (!hasNetworkErrorHandling) {
                this.analysis.edgeCases.networkFailures.push({
                    file: relativePath,
                    issue: 'Network operations without offline/error handling'
                });
            }
        }
        
        // Malformed data handling
        const hasDataValidation = content.includes('JSON.parse') && 
                                 (content.includes('try') || content.includes('.catch'));
        
        if (content.includes('JSON.parse') && !hasDataValidation) {
            this.analysis.edgeCases.malformedData.push({
                file: relativePath,
                issue: 'JSON parsing without error handling'
            });
        }
        
        // User input validation
        if (content.includes('input') || content.includes('form') || content.includes('value')) {
            const hasInputValidation = content.includes('validate') || 
                                      content.includes('sanitize') ||
                                      content.includes('trim()');
            
            if (!hasInputValidation) {
                this.analysis.edgeCases.userInput.push({
                    file: relativePath,
                    issue: 'Potential user input without validation'
                });
            }
        }
        
        // Null/undefined checks
        const nullCheckPatterns = [
            /\w+\?\./g, // Optional chaining
            /\w+\s*&&\s*\w+\./g, // Logical AND guard
            /if\s*\(\s*\w+\s*\)/g // Simple null checks
        ];
        
        let nullChecks = 0;
        for (const pattern of nullCheckPatterns) {
            const matches = content.matchAll(pattern);
            nullChecks += Array.from(matches).length;
        }
        
        this.analysis.edgeCases.nullChecks.push({
            file: relativePath,
            count: nullChecks
        });
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Strict mode recommendations
        if (!this.analysis.strictMode.enabled) {
            recommendations.push({
                category: 'TypeScript Configuration',
                priority: 'high',
                issue: 'Strict mode is not enabled',
                recommendation: 'Enable strict mode in tsconfig.json for better type safety'
            });
        }
        
        if (this.analysis.strictMode.violations.length > 0) {
            recommendations.push({
                category: 'TypeScript Configuration',
                priority: 'medium',
                issue: `${this.analysis.strictMode.violations.length} strict flags are disabled`,
                recommendation: `Enable: ${this.analysis.strictMode.violations.join(', ')}`
            });
        }
        
        // Type coverage recommendations
        if (this.analysis.typeCoverage.percentage < 90) {
            recommendations.push({
                category: 'Type Coverage',
                priority: 'high',
                issue: `Type coverage is only ${this.analysis.typeCoverage.percentage.toFixed(1)}%`,
                recommendation: 'Add type annotations to improve type safety'
            });
        }
        
        if (this.analysis.typeCoverage.anyUsage.length > 0) {
            recommendations.push({
                category: 'Type Safety',
                priority: 'medium',
                issue: `${this.analysis.typeCoverage.anyUsage.length} usages of 'any' type`,
                recommendation: 'Replace any types with specific type definitions'
            });
        }
        
        // Error handling recommendations
        const errorHandlingRatio = this.analysis.errorHandling.asyncOperations.total > 0 ?
            this.analysis.errorHandling.asyncOperations.withErrorHandling / 
            this.analysis.errorHandling.asyncOperations.total : 1;
        
        if (errorHandlingRatio < 0.8) {
            recommendations.push({
                category: 'Error Handling',
                priority: 'high',
                issue: `Only ${(errorHandlingRatio * 100).toFixed(1)}% of async operations have error handling`,
                recommendation: 'Add proper error handling to all async operations'
            });
        }
        
        if (!this.analysis.errorHandling.errorBoundaries.present) {
            recommendations.push({
                category: 'Error Boundaries',
                priority: 'medium',
                issue: 'No error boundaries detected',
                recommendation: 'Implement error boundaries for graceful error handling'
            });
        }
        
        // Edge case recommendations
        if (this.analysis.edgeCases.networkFailures.length > 0) {
            recommendations.push({
                category: 'Network Reliability',
                priority: 'high',
                issue: `${this.analysis.edgeCases.networkFailures.length} network operations without offline handling`,
                recommendation: 'Add network failure and offline state handling'
            });
        }
        
        if (this.analysis.edgeCases.malformedData.length > 0) {
            recommendations.push({
                category: 'Data Validation',
                priority: 'high',
                issue: `${this.analysis.edgeCases.malformedData.length} JSON parsing operations without error handling`,
                recommendation: 'Add try-catch blocks around JSON.parse operations'
            });
        }
        
        this.analysis.recommendations = recommendations;
    }

    async walkDirectory(dir, fileHandler) {
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory() && !file.name.startsWith('.')) {
                    await this.walkDirectory(fullPath, fileHandler);
                } else if (this.isAnalyzableFile(file.name)) {
                    await fileHandler(fullPath);
                }
            }
        } catch (error) {
            console.error(`Error walking directory ${dir}:`, error);
        }
    }

    isAnalyzableFile(filename) {
        return filename.endsWith('.ts') || 
               filename.endsWith('.js') || 
               filename.endsWith('.svelte');
    }

    getLineContext(content, index) {
        const lines = content.split('\n');
        const lineNumber = content.substring(0, index).split('\n').length - 1;
        const start = Math.max(0, lineNumber - 1);
        const end = Math.min(lines.length, lineNumber + 2);
        return lines.slice(start, end).join('\n');
    }

    async generateReport() {
        await this.analyzeTypeScript();
        
        const reportPath = path.join(rootDir, 'typescript-safety-report.json');
        await fs.writeFile(reportPath, JSON.stringify(this.analysis, null, 2));
        
        this.printSummary();
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
        return this.analysis;
    }

    printSummary() {
        console.log('\n🔒 TypeScript Safety & Error Handling Analysis');
        console.log('=' . repeat(60));
        
        console.log(`\n📝 TypeScript Configuration:`);
        console.log(`   Strict Mode: ${this.analysis.strictMode.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Strict Violations: ${this.analysis.strictMode.violations.length}`);
        
        console.log(`\n📊 Type Coverage:`);
        console.log(`   Overall Coverage: ${this.analysis.typeCoverage.percentage.toFixed(1)}%`);
        console.log(`   Files without TypeScript: ${this.analysis.typeCoverage.untypedFiles.length}`);
        console.log(`   'any' Usage: ${this.analysis.typeCoverage.anyUsage.length}`);
        console.log(`   Implicit any: ${this.analysis.typeCoverage.implicitAny.length}`);
        
        console.log(`\n🚨 Error Handling:`);
        console.log(`   Async Operations: ${this.analysis.errorHandling.asyncOperations.total}`);
        console.log(`   With Error Handling: ${this.analysis.errorHandling.asyncOperations.withErrorHandling}`);
        console.log(`   Missing Error Handling: ${this.analysis.errorHandling.asyncOperations.missingErrorHandling.length}`);
        console.log(`   Try-Catch Blocks: ${this.analysis.errorHandling.trycatches.total}`);
        console.log(`   Error Boundaries: ${this.analysis.errorHandling.errorBoundaries.present ? 'Present' : 'Missing'}`);
        
        console.log(`\n⚠️  Edge Cases:`);
        console.log(`   Network Failure Handling: ${this.analysis.edgeCases.networkFailures.length} issues`);
        console.log(`   Malformed Data Handling: ${this.analysis.edgeCases.malformedData.length} issues`);
        console.log(`   User Input Validation: ${this.analysis.edgeCases.userInput.length} potential issues`);
        
        console.log(`\n💡 Recommendations:`);
        for (const rec of this.analysis.recommendations.slice(0, 5)) {
            console.log(`   [${rec.priority.toUpperCase()}] ${rec.category}: ${rec.issue}`);
        }
        
        if (this.analysis.recommendations.length > 5) {
            console.log(`   ... and ${this.analysis.recommendations.length - 5} more`);
        }
    }
}

// Run analysis
const analyzer = new TypeScriptSafetyAnalyzer();
analyzer.generateReport().catch(console.error);