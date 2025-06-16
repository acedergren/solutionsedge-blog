import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'acorn';
import { simple as walkSimple } from 'acorn-walk';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

class TreeShakingAnalyzer {
    constructor() {
        this.analysis = {
            timestamp: new Date().toISOString(),
            sourceFiles: {},
            bundleFiles: {},
            unusedExports: [],
            unusedImports: [],
            treeShakingEfficiency: 0,
            recommendations: []
        };
    }

    async analyzeSourceFiles() {
        const srcDir = path.join(rootDir, 'src');
        await this.walkDirectory(srcDir, 'source');
    }

    async analyzeBundleFiles() {
        const buildDir = path.join(rootDir, '.svelte-kit/output/client');
        await this.walkDirectory(buildDir, 'bundle');
    }

    async walkDirectory(dir, type) {
        try {
            const files = await fs.readdir(dir, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dir, file.name);
                
                if (file.isDirectory() && !file.name.startsWith('.')) {
                    await this.walkDirectory(fullPath, type);
                } else if (file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.svelte')) {
                    await this.analyzeFile(fullPath, type);
                }
            }
        } catch (error) {
            console.error(`Error walking directory ${dir}:`, error);
        }
    }

    async analyzeFile(filePath, type) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(rootDir, filePath);
            
            const fileAnalysis = {
                path: relativePath,
                size: content.length,
                exports: [],
                imports: [],
                usedExports: new Set(),
                usedImports: new Set()
            };

            // Extract exports and imports
            if (filePath.endsWith('.svelte')) {
                // Parse Svelte script blocks
                const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/);
                if (scriptMatch) {
                    this.parseJavaScript(scriptMatch[1], fileAnalysis);
                }
            } else {
                this.parseJavaScript(content, fileAnalysis);
            }

            if (type === 'source') {
                this.analysis.sourceFiles[relativePath] = fileAnalysis;
            } else {
                this.analysis.bundleFiles[relativePath] = fileAnalysis;
            }
        } catch (error) {
            console.error(`Error analyzing file ${filePath}:`, error);
        }
    }

    parseJavaScript(code, fileAnalysis) {
        try {
            // Remove TypeScript type annotations for parsing
            const cleanCode = code
                .replace(/:\s*\w+(\[\])?/g, '') // Remove type annotations
                .replace(/as\s+\w+/g, '') // Remove type assertions
                .replace(/import\s+type\s+/g, 'import '); // Convert type imports

            const ast = parse(cleanCode, {
                ecmaVersion: 2020,
                sourceType: 'module',
                allowImportExportEverywhere: true
            });

            walkSimple(ast, {
                ExportNamedDeclaration(node) {
                    if (node.declaration) {
                        if (node.declaration.id) {
                            fileAnalysis.exports.push(node.declaration.id.name);
                        } else if (node.declaration.declarations) {
                            node.declaration.declarations.forEach(decl => {
                                if (decl.id && decl.id.name) {
                                    fileAnalysis.exports.push(decl.id.name);
                                }
                            });
                        }
                    }
                    if (node.specifiers) {
                        node.specifiers.forEach(spec => {
                            fileAnalysis.exports.push(spec.exported.name);
                        });
                    }
                },
                ExportDefaultDeclaration() {
                    fileAnalysis.exports.push('default');
                },
                ImportDeclaration(node) {
                    const importInfo = {
                        source: node.source.value,
                        specifiers: []
                    };
                    
                    node.specifiers.forEach(spec => {
                        if (spec.type === 'ImportDefaultSpecifier') {
                            importInfo.specifiers.push('default');
                        } else if (spec.type === 'ImportSpecifier') {
                            importInfo.specifiers.push(spec.imported.name);
                        }
                    });
                    
                    fileAnalysis.imports.push(importInfo);
                },
                CallExpression(node) {
                    // Track dynamic imports
                    if (node.callee.type === 'Import' && node.arguments[0]) {
                        fileAnalysis.imports.push({
                            source: 'dynamic',
                            specifiers: ['*']
                        });
                    }
                }
            });
        } catch (error) {
            // Parsing errors are expected for some files
            console.debug(`Parse error in file analysis: ${error.message}`);
        }
    }

    findUnusedCode() {
        // Compare source exports with what's actually in the bundle
        for (const [sourcePath, sourceFile] of Object.entries(this.analysis.sourceFiles)) {
            for (const exportName of sourceFile.exports) {
                let isUsed = false;
                
                // Check if this export appears in any bundle file
                for (const bundleFile of Object.values(this.analysis.bundleFiles)) {
                    if (bundleFile.path.includes(sourcePath.replace('.ts', '.js').replace('.svelte', '.js'))) {
                        isUsed = true;
                        break;
                    }
                }
                
                if (!isUsed) {
                    this.analysis.unusedExports.push({
                        file: sourcePath,
                        export: exportName
                    });
                }
            }
        }

        // Calculate tree-shaking efficiency
        const totalSourceSize = Object.values(this.analysis.sourceFiles)
            .reduce((sum, file) => sum + file.size, 0);
        const totalBundleSize = Object.values(this.analysis.bundleFiles)
            .reduce((sum, file) => sum + file.size, 0);
        
        this.analysis.treeShakingEfficiency = 
            ((totalSourceSize - totalBundleSize) / totalSourceSize) * 100;
    }

    generateRecommendations() {
        const recommendations = [];

        // Check for unused exports
        if (this.analysis.unusedExports.length > 0) {
            recommendations.push({
                type: 'unused-exports',
                severity: 'medium',
                message: `Found ${this.analysis.unusedExports.length} potentially unused exports`,
                details: this.analysis.unusedExports.slice(0, 10)
            });
        }

        // Check for large files that might benefit from code splitting
        const largeFiles = Object.entries(this.analysis.sourceFiles)
            .filter(([_, file]) => file.size > 50000)
            .sort((a, b) => b[1].size - a[1].size);

        if (largeFiles.length > 0) {
            recommendations.push({
                type: 'large-files',
                severity: 'high',
                message: `${largeFiles.length} files exceed 50KB and could benefit from code splitting`,
                details: largeFiles.slice(0, 5).map(([path, file]) => ({
                    path,
                    size: `${(file.size / 1024).toFixed(2)}KB`
                }))
            });
        }

        // Check tree-shaking efficiency
        if (this.analysis.treeShakingEfficiency < 30) {
            recommendations.push({
                type: 'low-tree-shaking',
                severity: 'high',
                message: `Tree-shaking efficiency is only ${this.analysis.treeShakingEfficiency.toFixed(1)}%`,
                suggestion: 'Consider marking more code as side-effect-free or using dynamic imports'
            });
        }

        // Check for circular dependencies
        const circularDeps = this.findCircularDependencies();
        if (circularDeps.length > 0) {
            recommendations.push({
                type: 'circular-dependencies',
                severity: 'medium',
                message: `Found ${circularDeps.length} circular dependencies`,
                details: circularDeps
            });
        }

        this.analysis.recommendations = recommendations;
    }

    findCircularDependencies() {
        const dependencies = new Map();
        const circular = [];

        // Build dependency graph
        for (const [path, file] of Object.entries(this.analysis.sourceFiles)) {
            const deps = file.imports.map(imp => imp.source).filter(src => src.startsWith('.'));
            dependencies.set(path, deps);
        }

        // Simple circular dependency detection
        const visited = new Set();
        const visiting = new Set();

        function hasCycle(node, graph, path = []) {
            if (visiting.has(node)) {
                const cycleStart = path.indexOf(node);
                if (cycleStart !== -1) {
                    circular.push(path.slice(cycleStart));
                }
                return true;
            }
            if (visited.has(node)) return false;

            visiting.add(node);
            path.push(node);

            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                if (hasCycle(neighbor, graph, [...path])) {
                    return true;
                }
            }

            visiting.delete(node);
            visited.add(node);
            return false;
        }

        for (const node of dependencies.keys()) {
            if (!visited.has(node)) {
                hasCycle(node, dependencies);
            }
        }

        return circular;
    }

    async generateReport() {
        console.log('🌳 Analyzing tree-shaking effectiveness...\n');

        await this.analyzeSourceFiles();
        await this.analyzeBundleFiles();
        this.findUnusedCode();
        this.generateRecommendations();

        // Save detailed report
        const reportPath = path.join(rootDir, 'tree-shaking-report.json');
        await fs.writeFile(reportPath, JSON.stringify(this.analysis, null, 2));

        // Console summary
        console.log('Tree-Shaking Analysis Summary');
        console.log('=' . repeat(60));
        console.log(`Source Files: ${Object.keys(this.analysis.sourceFiles).length}`);
        console.log(`Bundle Files: ${Object.keys(this.analysis.bundleFiles).length}`);
        console.log(`Tree-Shaking Efficiency: ${this.analysis.treeShakingEfficiency.toFixed(1)}%`);
        console.log(`Unused Exports: ${this.analysis.unusedExports.length}`);

        if (this.analysis.recommendations.length > 0) {
            console.log('\nRecommendations:');
            for (const rec of this.analysis.recommendations) {
                console.log(`\n[${rec.severity.toUpperCase()}] ${rec.type}`);
                console.log(`  ${rec.message}`);
                if (rec.suggestion) {
                    console.log(`  Suggestion: ${rec.suggestion}`);
                }
            }
        }

        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }
}

// Add acorn dependencies check
async function checkDependencies() {
    try {
        await import('acorn');
        await import('acorn-walk');
    } catch (error) {
        console.error('Missing required dependencies. Please run:');
        console.error('npm install --save-dev acorn acorn-walk');
        process.exit(1);
    }
}

// Run analyzer
async function main() {
    await checkDependencies();
    const analyzer = new TreeShakingAnalyzer();
    await analyzer.generateReport();
}

main().catch(console.error);