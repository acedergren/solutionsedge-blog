import yaml from 'js-yaml';
import type { BlogPostMetadata, BlogPost } from '$lib/types/blog';

// We'll initialize these lazily to avoid SSR issues
let TurndownService: any;
let DOMPurify: any;
let turndownService: any;

async function initializeServices() {
	if (!turndownService && typeof window !== 'undefined') {
		const [TurndownModule, DOMPurifyModule] = await Promise.all([
			import('turndown'),
			import('dompurify')
		]);
		
		TurndownService = TurndownModule.default;
		DOMPurify = DOMPurifyModule.default;
		
		// Configure Turndown service for clean markdown conversion
		turndownService = new TurndownService({
			headingStyle: 'atx',
			codeBlockStyle: 'fenced',
			bulletListMarker: '-',
			strongDelimiter: '**',
			emDelimiter: '_',
			linkStyle: 'inlined'
		});
		
		// Add custom rules for better markdown output
		turndownService.addRule('strikethrough', {
			filter: ['del', 's', 'strike'],
			replacement: function (content: string) {
				return '~~' + content + '~~';
			}
		});
		
		turndownService.addRule('underline', {
			filter: ['u'],
			replacement: function (content: string) {
				return '<u>' + content + '</u>';
			}
		});
	}
}


/**
 * Generate frontmatter from metadata
 */
export function generateFrontmatter(metadata: BlogPostMetadata): string {
	const frontmatterData = {
		title: metadata.title,
		slug: metadata.slug,
		author: metadata.author,
		publishDate: metadata.publishDate.toISOString(),
		tags: metadata.tags,
		excerpt: metadata.excerpt,
		...(metadata.featured !== undefined && { featured: metadata.featured }),
		...(metadata.draft !== undefined && { draft: metadata.draft }),
		...(metadata.coverImage && { coverImage: metadata.coverImage }),
		...(metadata.status && { status: metadata.status }),
		...(metadata.scheduledDate && { scheduledDate: metadata.scheduledDate.toISOString() }),
		...(metadata.lastModified && { lastModified: metadata.lastModified.toISOString() }),
		...(metadata.viewCount !== undefined && { viewCount: metadata.viewCount })
	};
	
	const yamlStr = yaml.dump(frontmatterData, {
		indent: 2,
		lineWidth: 80,
		noRefs: true,
		sortKeys: false
	});
	
	return `---\n${yamlStr}---\n\n`;
}

/**
 * Parse frontmatter from markdown content
 */
export function parseFrontmatter(markdown: string): { metadata: Partial<BlogPostMetadata> | null; content: string } {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = markdown.match(frontmatterRegex);
	
	if (!match) {
		return { metadata: null, content: markdown };
	}
	
	try {
		const yamlContent = match[1];
		const content = match[2].trim();
		const metadata = yaml.load(yamlContent) as any;
		
		// Convert date string back to Date object
		if (metadata.publishDate) {
			metadata.publishDate = new Date(metadata.publishDate);
		}
		
		return { metadata, content };
	} catch (error) {
		console.error('Failed to parse frontmatter:', error);
		return { metadata: null, content: markdown };
	}
}

/**
 * Convert HTML to clean markdown
 */
export async function htmlToMarkdown(html: string): Promise<string> {
	await initializeServices();
	
	if (!DOMPurify || !turndownService) {
		// Fallback for SSR - just return the HTML
		return html;
	}
	
	// First sanitize the HTML
	const sanitizedHtml = DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'p', 'br', 'hr',
			'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike',
			'a', 'img',
			'ul', 'ol', 'li',
			'blockquote',
			'pre', 'code',
			'table', 'thead', 'tbody', 'tr', 'th', 'td'
		],
		ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class']
	});
	
	// Convert to markdown
	return turndownService.turndown(sanitizedHtml);
}

/**
 * Synchronous version for server-side use
 */
export function htmlToMarkdownSync(html: string): string {
	// For SSR, just return a basic conversion
	return html
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<p[^>]*>/gi, '\n\n')
		.replace(/<\/p>/gi, '')
		.replace(/<strong[^>]*>|<b[^>]*>/gi, '**')
		.replace(/<\/strong>|<\/b>/gi, '**')
		.replace(/<em[^>]*>|<i[^>]*>/gi, '_')
		.replace(/<\/em>|<\/i>/gi, '_')
		.replace(/<[^>]+>/g, '');
}

/**
 * Generate complete markdown file with frontmatter
 */
export function generateMarkdownFile(post: BlogPost): string {
	const metadata: BlogPostMetadata = {
		title: post.title,
		slug: post.slug,
		author: post.author,
		publishDate: post.publishDate,
		tags: post.tags,
		excerpt: post.excerpt,
		featured: post.featured,
		draft: post.draft,
		coverImage: post.coverImage,
		status: post.status,
		scheduledDate: post.scheduledDate,
		lastModified: post.lastModified
	};
	
	const frontmatter = generateFrontmatter(metadata);
	const markdownContent = htmlToMarkdownSync(post.htmlContent || post.content);
	
	return frontmatter + markdownContent;
}

/**
 * Sanitize content to prevent XSS
 */
export async function sanitizeContent(content: string): Promise<string> {
	await initializeServices();
	
	if (!DOMPurify) {
		// Fallback for SSR - just return the content
		return content;
	}
	
	return DOMPurify.sanitize(content, {
		ALLOWED_TAGS: [
			'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
			'p', 'br', 'hr',
			'strong', 'b', 'em', 'i', 'u', 's', 'del', 'strike',
			'a', 'img',
			'ul', 'ol', 'li',
			'blockquote',
			'pre', 'code',
			'table', 'thead', 'tbody', 'tr', 'th', 'td',
			'div', 'span'
		],
		ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
		ALLOW_DATA_ATTR: false
	});
}

/**
 * Extract excerpt from content if not provided
 */
export function extractExcerpt(content: string, maxLength: number = 160): string {
	// Convert HTML to text
	const temp = document.createElement('div');
	temp.innerHTML = content;
	const text = temp.textContent || temp.innerText || '';
	
	// Clean up whitespace
	const cleanText = text.replace(/\s+/g, ' ').trim();
	
	// Truncate to maxLength
	if (cleanText.length <= maxLength) {
		return cleanText;
	}
	
	// Find last complete word within maxLength
	const truncated = cleanText.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	
	return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}