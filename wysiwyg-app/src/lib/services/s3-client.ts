import type { BlogPost } from '$lib/types/blog';
import type { S3File, S3UploadResult, UploadProgress } from '$lib/services/s3';

/**
 * Client-side S3 API service
 */
export class S3ClientService {
	private onProgress?: (progress: UploadProgress) => void;
	
	/**
	 * Set progress callback
	 */
	setProgressCallback(callback: (progress: UploadProgress) => void) {
		this.onProgress = callback;
	}
	
	/**
	 * Upload markdown content
	 */
	async uploadMarkdown(post: BlogPost): Promise<S3UploadResult> {
		try {
			const response = await fetch('/api/s3/upload', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					type: 'markdown',
					content: post.htmlContent || post.content,
					metadata: {
						title: post.title,
						slug: post.slug,
						author: post.author,
						publishDate: post.publishDate,
						tags: post.tags,
						excerpt: post.excerpt,
						featured: post.featured,
						draft: post.draft,
						coverImage: post.coverImage
					}
				})
			});
			
			return await response.json();
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Upload failed'
			};
		}
	}
	
	/**
	 * Upload image with progress tracking
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
			const formData = new FormData();
			formData.append('file', file);
			formData.append('maxWidth', String(options.maxWidth || 1920));
			formData.append('maxHeight', String(options.maxHeight || 1080));
			formData.append('quality', String(options.quality || 85));
			
			// Create XMLHttpRequest for progress tracking
			return new Promise((resolve) => {
				const xhr = new XMLHttpRequest();
				
				xhr.upload.addEventListener('progress', (e) => {
					if (e.lengthComputable && this.onProgress) {
						this.onProgress({
							loaded: e.loaded,
							total: e.total,
							percentage: Math.round((e.loaded / e.total) * 100)
						});
					}
				});
				
				xhr.addEventListener('load', () => {
					if (xhr.status === 200) {
						resolve(JSON.parse(xhr.responseText));
					} else {
						resolve({
							success: false,
							error: `Upload failed with status ${xhr.status}`
						});
					}
				});
				
				xhr.addEventListener('error', () => {
					resolve({
						success: false,
						error: 'Network error during upload'
					});
				});
				
				xhr.open('POST', '/api/s3/image');
				xhr.send(formData);
			});
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Upload failed'
			};
		}
	}
	
	/**
	 * List files
	 */
	async listFiles(prefix?: string, maxKeys?: number): Promise<{ success: boolean; files?: S3File[]; error?: string }> {
		try {
			const params = new URLSearchParams();
			if (prefix) params.append('prefix', prefix);
			if (maxKeys) params.append('maxKeys', String(maxKeys));
			
			const response = await fetch(`/api/s3/list?${params}`, {
				method: 'GET'
			});
			
			return await response.json();
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to list files'
			};
		}
	}
	
	/**
	 * Delete file
	 */
	async deleteFile(key: string): Promise<{ success: boolean; message?: string; error?: string }> {
		try {
			const response = await fetch('/api/s3/delete', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ key })
			});
			
			return await response.json();
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Delete failed'
			};
		}
	}
}