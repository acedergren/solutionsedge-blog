import type { BlogPost, ExportOptions } from '$lib/types/blog';
import { generateMarkdownFile } from './markdown';

/**
 * Export blog post as markdown file
 */
export async function exportAsMarkdown(post: BlogPost, options: ExportOptions = {}): Promise<void> {
	const {
		includeHtml = false,
		includeFrontmatter = true,
		filename
	} = options;
	
	// Generate content
	let content = '';
	
	if (includeFrontmatter) {
		content = generateMarkdownFile(post);
	} else {
		// Just the markdown content without frontmatter
		const turndownService = new (await import('turndown')).default();
		content = turndownService.turndown(post.htmlContent || post.content);
	}
	
	// Add HTML comment with original HTML if requested
	if (includeHtml && post.htmlContent) {
		content += '\n\n<!-- Original HTML:\n' + post.htmlContent + '\n-->';
	}
	
	// Generate filename
	const defaultFilename = `${post.slug || 'untitled'}-${formatDate(post.publishDate)}.md`;
	const finalFilename = filename || defaultFilename;
	
	// Create and download file
	downloadFile(content, finalFilename, 'text/markdown');
}

/**
 * Export blog post as JSON
 */
export function exportAsJson(post: BlogPost, filename?: string): void {
	const jsonContent = JSON.stringify(post, null, 2);
	const defaultFilename = `${post.slug || 'untitled'}-${formatDate(post.publishDate)}.json`;
	const finalFilename = filename || defaultFilename;
	
	downloadFile(jsonContent, finalFilename, 'application/json');
}

/**
 * Export multiple posts as a single markdown file
 */
export function exportMultipleAsMarkdown(posts: BlogPost[], filename: string = 'blog-posts.md'): void {
	const content = posts
		.map(post => generateMarkdownFile(post))
		.join('\n\n---\n\n'); // Separate posts with horizontal rule
	
	downloadFile(content, filename, 'text/markdown');
}

/**
 * Download file to user's computer
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	
	document.body.appendChild(link);
	link.click();
	
	// Clean up
	setTimeout(() => {
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, 100);
}

/**
 * Format date for filename
 */
function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	
	return `${year}-${month}-${day}`;
}

/**
 * Create a backup of all drafts
 */
export function createBackup(posts: BlogPost[]): void {
	const backup = {
		version: '1.0',
		exportDate: new Date().toISOString(),
		posts: posts
	};
	
	const jsonContent = JSON.stringify(backup, null, 2);
	const filename = `backup-${formatDate(new Date())}.json`;
	
	downloadFile(jsonContent, filename, 'application/json');
}