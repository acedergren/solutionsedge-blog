import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getS3Config, createS3Client } from '$lib/services/s3/config';
import { S3Service, parseS3Error } from '$lib/services/s3';
import { generateMarkdownFile } from '$lib/utils/markdown';
import type { BlogPost } from '$lib/types/blog';

interface PublishResult {
	success: boolean;
	key?: string;
	url?: string;
	error?: string;
	rollbackKey?: string;
}

export const POST: RequestHandler = async ({ request }) => {
	let rollbackData: { key: string; content: string } | null = null;
	
	try {
		const config = getS3Config();
		if (!config || !config.accessKeyId || !config.secretAccessKey) {
			return json({ 
				success: false, 
				error: 'S3 configuration missing' 
			}, { status: 500 });
		}
		
		const data = await request.json();
		const { type, content, metadata } = data;
		
		const s3Client = createS3Client(config);
		const s3Service = new S3Service(s3Client, config);
		
		if (type === 'markdown') {
			const result = await publishMarkdownWithRollback(s3Service, data);
			return json(result);
		} else if (type === 'image') {
			// Handle image upload (would need multipart form data)
			return json({ 
				success: false, 
				error: 'Image upload requires multipart form data' 
			}, { status: 400 });
		} else {
			return json({ 
				success: false, 
				error: 'Invalid upload type' 
			}, { status: 400 });
		}
	} catch (error) {
		// Attempt rollback if we have rollback data
		if (rollbackData) {
			try {
				const config = getS3Config();
				if (config) {
					const s3Client = createS3Client(config);
					const s3Service = new S3Service(s3Client, config);
					await s3Service.uploadFile(rollbackData.key, rollbackData.content, 'text/markdown');
				}
			} catch (rollbackError) {
				console.error('Rollback failed:', rollbackError);
			}
		}
		
		const s3Error = parseS3Error(error);
		return json({ 
			success: false, 
			error: s3Error.message,
			errorType: s3Error.type
		}, { status: 500 });
	}
};

async function publishMarkdownWithRollback(
	s3Service: S3Service, 
	data: any
): Promise<PublishResult> {
	const { content, metadata } = data;
	let backupKey: string | null = null;
	let originalContent: string | null = null;
	
	try {
		// Create blog post and generate markdown
		const post: BlogPost = {
			...metadata,
			content,
			htmlContent: content,
			lastModified: new Date(),
			status: metadata.status || 'published'
		};
		
		const markdownContent = generateMarkdownFile(post);
		const publishDate = new Date(post.publishDate);
		const targetKey = `publish/${publishDate.getFullYear()}/${String(publishDate.getMonth() + 1).padStart(2, '0')}/${post.slug}.md`;
		
		// Step 1: Check if file exists and create backup
		const existingFile = await s3Service.getFile(targetKey);
		if (existingFile.success && existingFile.content) {
			originalContent = existingFile.content;
			
			// Create timestamped backup
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			backupKey = `backups/${post.slug}-${timestamp}.md`;
			
			const backupResult = await s3Service.uploadFile(
				backupKey, 
				originalContent, 
				'text/markdown'
			);
			
			if (!backupResult.success) {
				throw new Error(`Failed to create backup: ${backupResult.error}`);
			}
		}
		
		// Step 2: Upload new content
		const uploadResult = await s3Service.uploadFile(
			targetKey,
			markdownContent,
			'text/markdown'
		);
		
		if (!uploadResult.success) {
			throw new Error(`Failed to upload: ${uploadResult.error}`);
		}
		
		// Step 3: Validate upload by reading it back
		const validation = await s3Service.getFile(targetKey);
		if (!validation.success || validation.content !== markdownContent) {
			throw new Error('Upload validation failed - content mismatch');
		}
		
		// Step 4: Update analytics (if implemented)
		try {
			await updatePostAnalytics(post);
		} catch (analyticsError) {
			console.warn('Analytics update failed:', analyticsError);
			// Don't fail the whole operation for analytics
		}
		
		return {
			success: true,
			key: targetKey,
			url: getPublicUrl(targetKey),
			rollbackKey: backupKey || undefined
		};
		
	} catch (error) {
		// Rollback: restore original content if we had it
		if (originalContent && targetKey) {
			try {
				await s3Service.uploadFile(targetKey, originalContent, 'text/markdown');
				console.log('Successfully rolled back to original content');
			} catch (rollbackError) {
				console.error('Rollback failed:', rollbackError);
			}
		}
		
		// Clean up backup if it was created
		if (backupKey) {
			try {
				await s3Service.deleteFile(backupKey);
			} catch (cleanupError) {
				console.warn('Backup cleanup failed:', cleanupError);
			}
		}
		
		throw error;
	}
}

async function updatePostAnalytics(post: BlogPost): Promise<void> {
	// Placeholder for analytics tracking
	// This would integrate with your analytics system
	console.log(`Analytics: Post ${post.slug} published/updated at ${new Date().toISOString()}`);
}

function getPublicUrl(key: string): string {
	// This should match the logic in the S3Service
	const endpoint = process.env.S3_ENDPOINT;
	const bucket = process.env.S3_BUCKET_NAME;
	const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true';
	
	if (endpoint && forcePathStyle) {
		return `${endpoint}/${bucket}/${key}`;
	}
	
	return `https://${bucket}.s3.amazonaws.com/${key}`;
}