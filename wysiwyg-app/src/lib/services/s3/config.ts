import { S3Client } from '@aws-sdk/client-s3';
import { browser } from '$app/environment';

export interface S3Config {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	bucketName: string;
	endpoint?: string;
	forcePathStyle?: boolean;
}

/**
 * Get S3 configuration from environment variables
 * In a real app, these would come from server-side environment variables
 */
export function getS3Config(): S3Config | null {
	if (browser) {
		// In production, these should come from a secure API endpoint
		console.warn('S3 credentials should not be exposed to the browser in production');
		return null;
	}
	
	// Server-side configuration
	return {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
		region: process.env.AWS_REGION || 'us-east-1',
		bucketName: process.env.S3_BUCKET_NAME || '',
		endpoint: process.env.S3_ENDPOINT,
		forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true'
	};
}

/**
 * Create S3 client instance
 */
export function createS3Client(config: S3Config): S3Client {
	const clientConfig: any = {
		region: config.region,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey
		}
	};
	
	if (config.endpoint) {
		clientConfig.endpoint = config.endpoint;
		clientConfig.forcePathStyle = config.forcePathStyle || false;
	}
	
	return new S3Client(clientConfig);
}

/**
 * File path helpers
 */
export const S3_PATHS = {
	posts: (year: number, month: number, slug: string) => 
		`publish/${year}/${String(month).padStart(2, '0')}/${slug}.md`,
	
	postVersions: (year: number, month: number, slug: string, version: number) => 
		`publish/${year}/${String(month).padStart(2, '0')}/${slug}.v${version}.md`,
	
	images: (year: number, month: number, filename: string) => 
		`publish/assets/images/${year}/${String(month).padStart(2, '0')}/${filename}`,
	
	backups: (date: string) => 
		`backups/${date}-backup.json`
};

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
	const parts = filename.split('.');
	return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const extension = getFileExtension(originalName);
	const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
	const sanitizedName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
	
	return `${sanitizedName}-${timestamp}-${random}.${extension}`;
}