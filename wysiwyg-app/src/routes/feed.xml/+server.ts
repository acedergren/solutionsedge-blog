import { 
	AWS_ACCESS_KEY_ID, 
	AWS_SECRET_ACCESS_KEY, 
	AWS_REGION, 
	S3_BUCKET_NAME,
	S3_ENDPOINT,
	S3_FORCE_PATH_STYLE
} from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { marked } from 'marked';
import * as yaml from 'js-yaml';
import type { RequestHandler } from './$types';
import type { BlogPost } from '$lib/types/blog';

interface RSSItem {
	title: string;
	description: string;
	link: string;
	pubDate: string;
	guid: string;
	author?: string;
	category?: string[];
}

export const GET: RequestHandler = async () => {
	try {
		// Create S3 client
		const s3Client = new S3Client({
			region: AWS_REGION || 'us-east-1',
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY
			},
			endpoint: S3_ENDPOINT,
			forcePathStyle: S3_FORCE_PATH_STYLE === 'true'
		});

		// List published markdown files
		const listCommand = new ListObjectsV2Command({
			Bucket: S3_BUCKET_NAME,
			Prefix: 'publish/',
			MaxKeys: 50 // Limit RSS feed to 50 most recent posts
		});

		const listResponse = await s3Client.send(listCommand);
		
		if (!listResponse.Contents) {
			return generateEmptyRSS();
		}

		// Filter and sort markdown files
		const markdownFiles = listResponse.Contents
			.filter(obj => obj.Key?.endsWith('.md') && !obj.Key.includes('.v'))
			.sort((a, b) => {
				const aDate = a.LastModified?.getTime() || 0;
				const bDate = b.LastModified?.getTime() || 0;
				return bDate - aDate; // Most recent first
			})
			.slice(0, 20); // Limit to 20 most recent posts

		// Fetch and parse each markdown file
		const rssItems: RSSItem[] = [];
		
		for (const file of markdownFiles) {
			if (!file.Key) continue;
			
			try {
				const getCommand = new GetObjectCommand({
					Bucket: S3_BUCKET_NAME,
					Key: file.Key
				});
				
				const response = await s3Client.send(getCommand);
				const content = await response.Body?.transformToString();
				
				if (!content) continue;
				
				const post = parseMarkdownPost(content, file.Key);
				
				// Only include published posts
				if (post && post.status === 'published') {
					rssItems.push(createRSSItem(post));
				}
			} catch (error) {
				console.error(`Error processing file ${file.Key}:`, error);
				// Continue with other files
			}
		}

		const rssXml = generateRSSXML(rssItems);
		
		return new Response(rssXml, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'max-age=3600' // Cache for 1 hour
			}
		});
		
	} catch (error) {
		console.error('RSS generation error:', error);
		return new Response(generateEmptyRSS(), {
			headers: {
				'Content-Type': 'application/xml'
			},
			status: 500
		});
	}
};

function parseMarkdownPost(content: string, key: string): BlogPost | null {
	try {
		// Extract frontmatter
		const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		
		if (!frontmatterMatch) {
			return null;
		}
		
		const frontmatter = yaml.load(frontmatterMatch[1]) as any;
		const markdownContent = frontmatterMatch[2];
		
		// Parse markdown to HTML for description
		const htmlContent = marked(markdownContent);
		
		// Extract slug from file path
		const slug = key.split('/').pop()?.replace('.md', '') || '';
		
		return {
			title: frontmatter.title || '',
			slug,
			author: frontmatter.author || '',
			publishDate: new Date(frontmatter.date || frontmatter.publishDate),
			tags: frontmatter.tags || [],
			excerpt: frontmatter.description || frontmatter.excerpt || '',
			content: markdownContent,
			htmlContent,
			status: frontmatter.status || 'published',
			featured: frontmatter.featured || false,
			viewCount: 0
		};
	} catch (error) {
		console.error('Error parsing markdown:', error);
		return null;
	}
}

function createRSSItem(post: BlogPost): RSSItem {
	const baseUrl = PUBLIC_BASE_URL || 'https://example.com';
	const postUrl = `${baseUrl}/blog/${post.slug}`;
	
	// Create a clean description from excerpt or content
	let description = post.excerpt;
	if (!description && post.content) {
		// Take first 200 characters of content as description
		description = post.content.replace(/[#*`]/g, '').substring(0, 200);
		if (description.length === 200) {
			description += '...';
		}
	}
	
	return {
		title: post.title,
		description: description || '',
		link: postUrl,
		pubDate: post.publishDate.toUTCString(),
		guid: postUrl,
		author: post.author,
		category: post.tags
	};
}

function generateRSSXML(items: RSSItem[]): string {
	const baseUrl = PUBLIC_BASE_URL || 'https://example.com';
	const buildDate = new Date().toUTCString();
	
	const itemsXml = items.map(item => `
		<item>
			<title><![CDATA[${item.title}]]></title>
			<description><![CDATA[${item.description}]]></description>
			<link>${item.link}</link>
			<guid>${item.guid}</guid>
			<pubDate>${item.pubDate}</pubDate>
			${item.author ? `<author>${item.author}</author>` : ''}
			${item.category ? item.category.map(cat => `<category>${cat}</category>`).join('\n			') : ''}
		</item>
	`).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Solutions Edge Blog</title>
		<description>Latest articles and insights from Solutions Edge</description>
		<link>${baseUrl}/blog</link>
		<atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
		<language>en-us</language>
		<lastBuildDate>${buildDate}</lastBuildDate>
		<generator>SvelteKit RSS Generator</generator>
		${itemsXml}
	</channel>
</rss>`;
}

function generateEmptyRSS(): string {
	const baseUrl = PUBLIC_BASE_URL || 'https://example.com';
	const buildDate = new Date().toUTCString();
	
	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>Solutions Edge Blog</title>
		<description>Latest articles and insights from Solutions Edge</description>
		<link>${baseUrl}/blog</link>
		<atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
		<language>en-us</language>
		<lastBuildDate>${buildDate}</lastBuildDate>
		<generator>SvelteKit RSS Generator</generator>
	</channel>
</rss>`;
}