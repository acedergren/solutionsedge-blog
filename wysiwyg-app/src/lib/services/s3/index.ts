import {
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
	HeadObjectCommand,
	CopyObjectCommand
} from '@aws-sdk/client-s3';
import type { S3Client } from '@aws-sdk/client-s3';
import type { S3Config } from './config';
import { S3_PATHS, generateUniqueFilename } from './config';
import type { BlogPost } from '$lib/types/blog';
import { logger } from '$lib/logger';

export interface UploadProgress {
	loaded: number;
	total: number;
	percentage: number;
}

export interface S3File {
	key: string;
	size: number;
	lastModified: Date;
	url?: string;
}

export interface S3UploadResult {
	success: boolean;
	key?: string;
	url?: string;
	error?: string;
}

export class S3Service {
	private client: S3Client;
	private bucketName: string;
	private onProgress?: (progress: UploadProgress) => void;
	
	constructor(client: S3Client, config: S3Config) {
		this.client = client;
		this.bucketName = config.bucketName;
	}
	
	/**
	 * Set progress callback
	 */
	setProgressCallback(callback: (progress: UploadProgress) => void) {
		this.onProgress = callback;
	}
	
	/**
	 * Upload markdown file
	 */
	async uploadMarkdown(
		content: string,
		slug: string,
		date: Date = new Date()
	): Promise<S3UploadResult> {
		try {
			const key = S3_PATHS.posts(date.getFullYear(), date.getMonth() + 1, slug);
			
			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: content,
				ContentType: 'text/markdown',
				Metadata: {
					'uploaded-at': new Date().toISOString(),
					'content-type': 'blog-post'
				}
			});
			
			await this.client.send(command);
			logger.info(`Uploaded markdown to S3: ${key}`);
			
			return {
				success: true,
				key,
				url: this.getPublicUrl(key)
			};
		} catch (error) {
			logger.error('Failed to upload markdown:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
	
	/**
	 * Upload image with resizing
	 */
	async uploadImage(
		file: File,
		options: {
			maxWidth?: number;
			maxHeight?: number;
			quality?: number;
		} = {}
	): Promise<S3UploadResult> {
		try {
			// Generate unique filename
			const filename = generateUniqueFilename(file.name);
			const date = new Date();
			const key = S3_PATHS.images(date.getFullYear(), date.getMonth() + 1, filename);
			
			// Process image (in a real app, this would be done server-side)
			const processedBlob = await this.processImage(file, options);
			
			// Convert blob to buffer
			const buffer = await processedBlob.arrayBuffer();
			
			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: new Uint8Array(buffer),
				ContentType: file.type,
				Metadata: {
					'original-name': file.name,
					'uploaded-at': new Date().toISOString()
				}
			});
			
			// Upload with progress tracking
			await this.uploadWithProgress(command, file.size);
			
			logger.info(`Uploaded image to S3: ${key}`);
			
			return {
				success: true,
				key,
				url: this.getPublicUrl(key)
			};
		} catch (error) {
			logger.error('Failed to upload image:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
	
	/**
	 * Get file from S3
	 */
	async getFile(key: string): Promise<string | null> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key
			});
			
			const response = await this.client.send(command);
			if (!response.Body) return null;
			
			const stream = response.Body as ReadableStream;
			const reader = stream.getReader();
			const chunks: Uint8Array[] = [];
			
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
			}
			
			const buffer = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
			let offset = 0;
			for (const chunk of chunks) {
				buffer.set(chunk, offset);
				offset += chunk.length;
			}
			
			return new TextDecoder().decode(buffer);
		} catch (error) {
			logger.error(`Failed to get file ${key}:`, error);
			return null;
		}
	}
	
	/**
	 * Delete file from S3
	 */
	async deleteFile(key: string): Promise<boolean> {
		try {
			const command = new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key
			});
			
			await this.client.send(command);
			logger.info(`Deleted file from S3: ${key}`);
			return true;
		} catch (error) {
			logger.error(`Failed to delete file ${key}:`, error);
			return false;
		}
	}
	
	/**
	 * List files in a directory
	 */
	async listFiles(prefix: string, maxKeys: number = 100): Promise<S3File[]> {
		try {
			const command = new ListObjectsV2Command({
				Bucket: this.bucketName,
				Prefix: prefix,
				MaxKeys: maxKeys
			});
			
			const response = await this.client.send(command);
			const files: S3File[] = [];
			
			if (response.Contents) {
				for (const item of response.Contents) {
					if (item.Key && item.Size !== undefined && item.LastModified) {
						files.push({
							key: item.Key,
							size: item.Size,
							lastModified: item.LastModified,
							url: this.getPublicUrl(item.Key)
						});
					}
				}
			}
			
			return files;
		} catch (error) {
			logger.error(`Failed to list files with prefix ${prefix}:`, error);
			return [];
		}
	}
	
	/**
	 * Create versioned backup
	 */
	async createVersionedBackup(
		key: string,
		maxVersions: number = 5
	): Promise<boolean> {
		try {
			// Get existing versions
			const slug = key.split('/').pop()?.replace('.md', '') || '';
			const date = new Date();
			const baseKey = key.replace('.md', '');
			
			// List existing versions
			const versions = await this.listFiles(baseKey + '.v');
			versions.sort((a, b) => {
				const versionA = parseInt(a.key.match(/\.v(\d+)\.md$/)?.[1] || '0');
				const versionB = parseInt(b.key.match(/\.v(\d+)\.md$/)?.[1] || '0');
				return versionB - versionA;
			});
			
			// Copy current to new version
			const newVersion = versions.length > 0 
				? parseInt(versions[0].key.match(/\.v(\d+)\.md$/)?.[1] || '0') + 1 
				: 1;
			
			const versionKey = S3_PATHS.postVersions(
				date.getFullYear(),
				date.getMonth() + 1,
				slug,
				newVersion
			);
			
			const copyCommand = new CopyObjectCommand({
				Bucket: this.bucketName,
				CopySource: `${this.bucketName}/${key}`,
				Key: versionKey
			});
			
			await this.client.send(copyCommand);
			
			// Delete old versions if exceeding limit
			if (versions.length >= maxVersions) {
				const toDelete = versions.slice(maxVersions - 1);
				for (const file of toDelete) {
					await this.deleteFile(file.key);
				}
			}
			
			logger.info(`Created version ${newVersion} for ${key}`);
			return true;
		} catch (error) {
			logger.error('Failed to create versioned backup:', error);
			return false;
		}
	}
	
	/**
	 * Create full backup
	 */
	async createFullBackup(posts: BlogPost[]): Promise<S3UploadResult> {
		try {
			const backup = {
				version: '1.0',
				timestamp: new Date().toISOString(),
				count: posts.length,
				posts
			};
			
			const date = new Date().toISOString().split('T')[0];
			const key = S3_PATHS.backups(date);
			
			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: JSON.stringify(backup, null, 2),
				ContentType: 'application/json',
				Metadata: {
					'backup-date': date,
					'post-count': String(posts.length)
				}
			});
			
			await this.client.send(command);
			logger.info(`Created full backup: ${key}`);
			
			return {
				success: true,
				key,
				url: this.getPublicUrl(key)
			};
		} catch (error) {
			logger.error('Failed to create full backup:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
	
	/**
	 * Check if file exists
	 */
	async fileExists(key: string): Promise<boolean> {
		try {
			const command = new HeadObjectCommand({
				Bucket: this.bucketName,
				Key: key
			});
			
			await this.client.send(command);
			return true;
		} catch (error) {
			return false;
		}
	}
	
	/**
	 * Get file content
	 */
	async getFile(key: string): Promise<{ success: boolean; content?: string; error?: string }> {
		try {
			const command = new GetObjectCommand({
				Bucket: this.bucketName,
				Key: key
			});
			
			const response = await this.client.send(command);
			const content = await response.Body?.transformToString();
			
			return {
				success: true,
				content
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
	
	/**
	 * Upload file with content type
	 */
	async uploadFile(key: string, content: string, contentType: string): Promise<{ success: boolean; error?: string }> {
		try {
			const command = new PutObjectCommand({
				Bucket: this.bucketName,
				Key: key,
				Body: content,
				ContentType: contentType
			});
			
			await this.client.send(command);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
	
	/**
	 * Delete file
	 */
	async deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
		try {
			const command = new DeleteObjectCommand({
				Bucket: this.bucketName,
				Key: key
			});
			
			await this.client.send(command);
			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
	
	/**
	 * Get public URL for a file
	 */
	private getPublicUrl(key: string): string {
		// This assumes public bucket or presigned URLs
		// In production, you'd use presigned URLs for security
		
		// Check if using a custom endpoint (like Linode Object Storage)
		if (this.config.endpoint) {
			// For path-style URLs (when forcePathStyle is true)
			if (this.config.forcePathStyle) {
				return `${this.config.endpoint}/${this.bucketName}/${key}`;
			}
			// For DNS-style URLs
			const endpoint = new URL(this.config.endpoint);
			return `https://${this.bucketName}.${endpoint.host}/${key}`;
		}
		
		// Default AWS S3 URL format
		return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
	}
	
	/**
	 * Process image (placeholder - in production, use sharp on server)
	 */
	private async processImage(
		file: File,
		options: {
			maxWidth?: number;
			maxHeight?: number;
			quality?: number;
		}
	): Promise<Blob> {
		// In a real app, this would be done server-side with Sharp
		// For now, return the original file
		return file;
	}
	
	/**
	 * Upload with progress tracking
	 */
	private async uploadWithProgress(
		command: PutObjectCommand,
		totalSize: number
	): Promise<void> {
		// AWS SDK v3 doesn't have built-in progress for browser
		// In production, use multipart upload or track on server
		
		if (this.onProgress) {
			// Simulate progress for demo
			this.onProgress({ loaded: 0, total: totalSize, percentage: 0 });
		}
		
		const result = await this.client.send(command);
		
		if (this.onProgress) {
			this.onProgress({ loaded: totalSize, total: totalSize, percentage: 100 });
		}
		
		return;
	}
}

/**
 * Error types for better error handling
 */
export enum S3ErrorType {
	NETWORK_ERROR = 'NETWORK_ERROR',
	PERMISSION_ERROR = 'PERMISSION_ERROR',
	NOT_FOUND = 'NOT_FOUND',
	CONFLICT = 'CONFLICT',
	UNKNOWN = 'UNKNOWN'
}

/**
 * Parse S3 error
 */
export function parseS3Error(error: any): { type: S3ErrorType; message: string } {
	if (!error) {
		return { type: S3ErrorType.UNKNOWN, message: 'Unknown error' };
	}
	
	// Network errors
	if (error.name === 'NetworkError' || error.message?.includes('network')) {
		return { type: S3ErrorType.NETWORK_ERROR, message: 'Network connection failed' };
	}
	
	// Permission errors
	if (error.name === 'AccessDenied' || error.$metadata?.httpStatusCode === 403) {
		return { type: S3ErrorType.PERMISSION_ERROR, message: 'Access denied. Check your permissions.' };
	}
	
	// Not found
	if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
		return { type: S3ErrorType.NOT_FOUND, message: 'File not found' };
	}
	
	// Conflict
	if (error.$metadata?.httpStatusCode === 409) {
		return { type: S3ErrorType.CONFLICT, message: 'File conflict. The file may already exist.' };
	}
	
	return { 
		type: S3ErrorType.UNKNOWN, 
		message: error.message || 'An unexpected error occurred' 
	};
}