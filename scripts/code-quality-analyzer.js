import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class CodeQualityAnalyzer {
    constructor() {
        this.metrics = {
            timestamp: new Date().toISOString(),
            complexity: {
                cyclomatic: {},
                cognitive: {},
                average: 0,
                highest: { file: '', value: 0 }
            },
            functions: {
                analyzed: 0,
                singleResponsibility: 0,
                oversized: [],
                parameters: {
                    average: 0,
                    excessive: []
                }
            },
            imports: {
                circular: [],
                unused: [],
                complex: []
            },
            naming: {
                conventions: {
                    camelCase: 0,
                    PascalCase: 0,
                    kebabCase: 0,
                    inconsistent: []
                },
                descriptiveness: {
                    good: 0,
                    poor: []
                }
            },
            technicalDebt: {
                todos: [],
                deprecatedAPIs: [],
                temporaryFixes: [],
                score: 100
            },
            codeSmells: {
                duplicatedCode: [],
                longMethods: [],
                largeClasses: [],
                godObjects: []
            }
        };
    }

    async analyzeCodebase() {
        console.log('🔍 Analyzing code quality metrics...');
        
        const srcDir = path.join(rootDir, 'src');
        await this.walkDirectory(srcDir);
        
        this.calculateAverages();
        this.detectCodeSmells();
        this.calculateTechnicalDebtScore();
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
               filename.endsWith('.svelte');
    }

    async analyzeFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const relativePath = path.relative(rootDir, filePath);
        
        // Extract JavaScript content from Svelte files
        let jsContent = content;
        if (filePath.endsWith('.svelte')) {
            const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
            jsContent = scriptMatch ? scriptMatch[1] : '';
        }
        
        if (jsContent.trim()) {
            this.analyzeCyclomaticComplexity(jsContent, relativePath);
            this.analyzeCognitiveComplexity(jsContent, relativePath);
            this.analyzeFunctions(jsContent, relativePath);
            this.analyzeImports(jsContent, relativePath);
            this.analyzeNaming(jsContent, relativePath);
            this.analyzeTechnicalDebt(content, relativePath); // Use full content for debt analysis
        }
    }

    analyzeCyclomaticComplexity(content, filePath) {
        let complexity = 1; // Base complexity
        
        // Decision points that increase complexity
        const patterns = [
            /if\s*\(/g,           // if statements
            /else\s+if/g,         // else if
            /else(?!\s+if)/g,     // else
            /switch\s*\(/g,       // switch
            /case\s+/g,           // case
            /for\s*\(/g,          // for loops
            /while\s*\(/g,        // while loops
            /do\s*{/g,            // do-while
            /catch\s*\(/g,        // catch blocks
            /&&/g,                // logical AND
            /\|\|/g,              // logical OR
            /\?[^:]*:/g,          // ternary operators
            /\.forEach\(/g,       // forEach
            /\.map\(/g,           // map
            /\.filter\(/g,        // filter
            /\.reduce\(/g,        // reduce
        ];
        
        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        }
        
        this.metrics.complexity.cyclomatic[filePath] = complexity;
        
        if (complexity > this.metrics.complexity.highest.value) {
            this.metrics.complexity.highest = { file: filePath, value: complexity };
        }
    }

    analyzeCognitiveComplexity(content, filePath) {
        let complexity = 0;
        const lines = content.split('\n');
        let nestingLevel = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Track nesting level
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            nestingLevel += openBraces - closeBraces;
            
            // Cognitive complexity increases with nesting
            if (/if\s*\(|for\s*\(|while\s*\(|switch\s*\(/.test(trimmed)) {
                complexity += Math.max(1, nestingLevel);
            }
            
            // Binary logical operators in conditions
            if (/&&|\|\|/.test(trimmed) && /if\s*\(/.test(trimmed)) {
                complexity += 1;
            }
            
            // Recursive calls increase complexity significantly
            if (trimmed.includes('return ') && trimmed.includes('(')) {
                // Simple heuristic for recursion
                const functionName = this.extractFunctionName(line);
                if (functionName && content.includes(`function ${functionName}`) && 
                    trimmed.includes(functionName + '(')) {
                    complexity += 5;
                }
            }
        }
        
        this.metrics.complexity.cognitive[filePath] = complexity;
    }

    analyzeFunctions(content, filePath) {
        try {
            const cleanContent = this.cleanTypeScript(content);
            const ast = parse(cleanContent, {
                ecmaVersion: 2020,
                sourceType: 'module',
                allowImportExportEverywhere: true
            });

            walkSimple(ast, {
                FunctionDeclaration: (node) => {
                    this.analyzeFunctionNode(node, filePath);
                },
                FunctionExpression: (node) => {
                    this.analyzeFunctionNode(node, filePath);
                },
                ArrowFunctionExpression: (node) => {
                    this.analyzeFunctionNode(node, filePath);
                }
            });
        } catch (error) {
            // Parsing might fail for complex TypeScript, that's okay
        }
    }

    analyzeFunctionNode(node, filePath) {
        this.metrics.functions.analyzed++;
        
        const params = node.params ? node.params.length : 0;
        
        // Check for excessive parameters
        if (params > 5) {
            this.metrics.functions.parameters.excessive.push({
                file: filePath,
                function: node.id?.name || 'anonymous',
                parameters: params
            });
        }
        
        // Estimate function size (rough heuristic)
        const functionLength = node.end - node.start;
        if (functionLength > 500) {
            this.metrics.functions.oversized.push({
                file: filePath,
                function: node.id?.name || 'anonymous',
                size: functionLength
            });
        }
        
        // Simple single responsibility check
        const hasMultipleReturns = this.hasMultipleReturns(node);
        const hasMultipleConcerns = this.hasMultipleConcerns(node);
        
        if (!hasMultipleReturns && !hasMultipleConcerns) {
            this.metrics.functions.singleResponsibility++;
        }
    }

    hasMultipleReturns(node) {
        let returnCount = 0;
        
        walkSimple(node, {
            ReturnStatement: () => {
                returnCount++;
            }
        });
        
        return returnCount > 2; // Allow for early returns
    }

    hasMultipleConcerns(node) {
        // Simple heuristic: functions with many different types of operations
        const nodeString = JSON.stringify(node);
        
        let concernCount = 0;
        if (nodeString.includes('fetch') || nodeString.includes('XMLHttpRequest')) concernCount++;
        if (nodeString.includes('localStorage') || nodeString.includes('sessionStorage')) concernCount++;
        if (nodeString.includes('getElementById') || nodeString.includes('querySelector')) concernCount++;
        if (nodeString.includes('console.log') || nodeString.includes('console.error')) concernCount++;
        
        return concernCount > 2;
    }

    analyzeImports(content, filePath) {
        try {
            const cleanContent = this.cleanTypeScript(content);
            const ast = parse(cleanContent, {
                ecmaVersion: 2020,
                sourceType: 'module',
                allowImportExportEverywhere: true
            });

            const imports = [];
            
            walkSimple(ast, {
                ImportDeclaration: (node) => {
                    imports.push({
                        source: node.source.value,
                        specifiers: node.specifiers.map(s => s.local?.name || s.imported?.name)
                    });
                }
            });
            
            // Check for potentially unused imports (basic heuristic)
            for (const imp of imports) {
                for (const spec of imp.specifiers) {
                    if (spec && !content.includes(spec) && !content.includes(`${spec}(`)) {
                        this.metrics.imports.unused.push({
                            file: filePath,
                            import: spec,
                            from: imp.source
                        });
                    }
                }
            }
            
            // Check for complex import patterns
            if (imports.length > 15) {
                this.metrics.imports.complex.push({
                    file: filePath,
                    count: imports.length
                });
            }
            
        } catch (error) {
            // Parsing errors expected for some files
        }
    }

    analyzeNaming(content, filePath) {
        // Extract identifiers using regex patterns
        const identifiers = [
            ...content.matchAll(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g),
            ...content.matchAll(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g),
            ...content.matchAll(/class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g)
        ].map(match => match[1]);
        
        for (const identifier of identifiers) {
            if (!identifier) continue;
            
            // Check naming conventions
            if (this.isCamelCase(identifier)) {
                this.metrics.naming.conventions.camelCase++;
            } else if (this.isPascalCase(identifier)) {
                this.metrics.naming.conventions.PascalCase++;
            } else if (this.isKebabCase(identifier)) {
                this.metrics.naming.conventions.kebabCase++;
            } else {
                this.metrics.naming.conventions.inconsistent.push({
                    file: filePath,
                    identifier
                });
            }
            
            // Check descriptiveness
            if (this.isDescriptive(identifier)) {
                this.metrics.naming.descriptiveness.good++;
            } else {
                this.metrics.naming.descriptiveness.poor.push({
                    file: filePath,
                    identifier
                });
            }
        }
    }

    isCamelCase(str) {
        return /^[a-z][a-zA-Z0-9]*$/.test(str);
    }

    isPascalCase(str) {
        return /^[A-Z][a-zA-Z0-9]*$/.test(str);
    }

    isKebabCase(str) {
        return /^[a-z]+(-[a-z]+)*$/.test(str);
    }

    isDescriptive(identifier) {
        // Simple heuristics for descriptive naming
        if (identifier.length < 3) return false;
        if (/^[a-z]$|^[a-z][0-9]$/.test(identifier)) return false;
        if (['data', 'item', 'temp', 'val', 'obj'].includes(identifier)) return false;
        return true;
    }

    analyzeTechnicalDebt(content, filePath) {
        // TODO comments
        const todoMatches = content.matchAll(/(TODO|FIXME|HACK|XXX|BUG)(:?)(.+)/gi);
        for (const match of todoMatches) {
            this.metrics.technicalDebt.todos.push({
                file: filePath,
                type: match[1].toUpperCase(),
                description: match[3].trim(),
                line: content.substring(0, match.index).split('\n').length
            });
        }
        
        // Deprecated API usage patterns
        const deprecatedPatterns = [
            /componentWillMount/g,
            /componentWillReceiveProps/g,
            /componentWillUpdate/g,
            /UNSAFE_/g
        ];
        
        for (const pattern of deprecatedPatterns) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                this.metrics.technicalDebt.deprecatedAPIs.push({
                    file: filePath,
                    api: match[0],
                    line: content.substring(0, match.index).split('\n').length
                });
            }
        }
        
        // Temporary fixes (heuristics)
        const tempFixPatterns = [
            /\/\/ temporary/gi,
            /\/\/ quick fix/gi,
            /\/\/ workaround/gi,
            /\.any/g, // TypeScript any usage
            /console\.log/g // Console logs left in code
        ];
        
        for (const pattern of tempFixPatterns) {
            const matches = content.matchAll(pattern);
            for (const match of matches) {
                this.metrics.technicalDebt.temporaryFixes.push({
                    file: filePath,
                    pattern: match[0],
                    line: content.substring(0, match.index).split('\n').length
                });
            }
        }
    }

    calculateAverages() {
        const complexities = Object.values(this.metrics.complexity.cyclomatic);
        this.metrics.complexity.average = complexities.length > 0 ? 
            complexities.reduce((sum, val) => sum + val, 0) / complexities.length : 0;
        
        // Calculate average parameters
        const paramCounts = this.metrics.functions.parameters.excessive
            .map(f => f.parameters);
        this.metrics.functions.parameters.average = paramCounts.length > 0 ?
            paramCounts.reduce((sum, val) => sum + val, 0) / paramCounts.length : 0;
    }

    detectCodeSmells() {
        // Duplicated code detection (basic)
        const fileContents = new Map();
        // This would need more sophisticated analysis in practice
        
        // Long methods
        for (const func of this.metrics.functions.oversized) {
            this.metrics.codeSmells.longMethods.push(func);
        }
        
        // God objects (files with too many responsibilities)
        for (const [file, complexity] of Object.entries(this.metrics.complexity.cyclomatic)) {
            if (complexity > 50) {
                this.metrics.codeSmells.godObjects.push({
                    file,
                    complexity
                });
            }
        }
    }

    calculateTechnicalDebtScore() {
        let score = 100;
        
        // Deduct for each debt item
        score -= this.metrics.technicalDebt.todos.length * 2;
        score -= this.metrics.technicalDebt.deprecatedAPIs.length * 10;
        score -= this.metrics.technicalDebt.temporaryFixes.length * 5;
        
        // Deduct for high complexity
        if (this.metrics.complexity.average > 15) score -= 20;
        if (this.metrics.complexity.average > 25) score -= 30;
        
        // Deduct for code smells
        score -= this.metrics.codeSmells.longMethods.length * 5;
        score -= this.metrics.codeSmells.godObjects.length * 15;
        
        this.metrics.technicalDebt.score = Math.max(0, score);
    }

    extractFunctionName(line) {
        const match = line.match(/function\s+(\w+)/);
        return match ? match[1] : null;
    }

    cleanTypeScript(content) {
        return content
            .replace(/:\s*\w+(\[\])?(\s*\|\s*\w+(\[\])?)*(\s*=.*)?/g, '')
            .replace(/as\s+\w+/g, '')
            .replace(/import\s+type\s+/g, 'import ')
            .replace(/<.*?>/g, '')
            .replace(/interface\s+\w+\s*{[^}]*}/g, '')
            .replace(/type\s+\w+\s*=.*?;/g, '');
    }

    async generateReport() {
        await this.analyzeCodebase();
        
        const reportPath = path.join(rootDir, 'code-quality-report.json');
        await fs.writeFile(reportPath, JSON.stringify(this.metrics, null, 2));
        
        this.printSummary();
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
        return this.metrics;
    }

    printSummary() {
        console.log('\n📊 Code Quality Analysis Summary');
        console.log('=' . repeat(60));
        
        console.log(`\n🔢 Complexity Metrics:`);
        console.log(`   Average Cyclomatic Complexity: ${this.metrics.complexity.average.toFixed(2)}`);
        console.log(`   Highest Complexity: ${this.metrics.complexity.highest.value} (${this.metrics.complexity.highest.file})`);
        
        console.log(`\n🔧 Function Analysis:`);
        console.log(`   Functions Analyzed: ${this.metrics.functions.analyzed}`);
        console.log(`   Single Responsibility: ${this.metrics.functions.singleResponsibility}`);
        console.log(`   Oversized Functions: ${this.metrics.functions.oversized.length}`);
        console.log(`   Functions with Excessive Parameters: ${this.metrics.functions.parameters.excessive.length}`);
        
        console.log(`\n📦 Import Analysis:`);
        console.log(`   Potentially Unused Imports: ${this.metrics.imports.unused.length}`);
        console.log(`   Complex Import Patterns: ${this.metrics.imports.complex.length}`);
        
        console.log(`\n🏷️  Naming Conventions:`);
        console.log(`   camelCase: ${this.metrics.naming.conventions.camelCase}`);
        console.log(`   PascalCase: ${this.metrics.naming.conventions.PascalCase}`);
        console.log(`   Inconsistent: ${this.metrics.naming.conventions.inconsistent.length}`);
        console.log(`   Poor Names: ${this.metrics.naming.descriptiveness.poor.length}`);
        
        console.log(`\n💸 Technical Debt:`);
        console.log(`   TODO Comments: ${this.metrics.technicalDebt.todos.length}`);
        console.log(`   Deprecated APIs: ${this.metrics.technicalDebt.deprecatedAPIs.length}`);
        console.log(`   Temporary Fixes: ${this.metrics.technicalDebt.temporaryFixes.length}`);
        console.log(`   Debt Score: ${this.metrics.technicalDebt.score}/100`);
        
        console.log(`\n🦨 Code Smells:`);
        console.log(`   Long Methods: ${this.metrics.codeSmells.longMethods.length}`);
        console.log(`   God Objects: ${this.metrics.codeSmells.godObjects.length}`);
        
        // Recommendations
        console.log(`\n💡 Recommendations:`);
        if (this.metrics.complexity.average > 10) {
            console.log(`   - Reduce complexity in high-complexity files`);
        }
        if (this.metrics.functions.oversized.length > 0) {
            console.log(`   - Break down oversized functions`);
        }
        if (this.metrics.technicalDebt.todos.length > 5) {
            console.log(`   - Address TODO comments`);
        }
        if (this.metrics.imports.unused.length > 0) {
            console.log(`   - Remove unused imports`);
        }
    }
}

// Run analysis
const analyzer = new CodeQualityAnalyzer();
analyzer.generateReport().catch(console.error);