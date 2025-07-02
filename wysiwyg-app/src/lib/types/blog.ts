export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface BlogPostMetadata {
	title: string;
	slug: string;
	author: string;
	publishDate: Date;
	tags: string[];
	excerpt: string;
	featured?: boolean;
	draft?: boolean;
	coverImage?: string;
	status?: PostStatus;
	scheduledDate?: Date;
	lastModified?: Date;
	viewCount?: number;
}

export interface BlogPost extends BlogPostMetadata {
	content: string;
	htmlContent?: string;
}

export interface PostAnalytics {
	postId: string;
	viewCount: number;
	publishDate: Date;
	lastViewed?: Date;
}

export interface ValidationError {
	field: string;
	message: string;
}

export interface ExportOptions {
	includeHtml?: boolean;
	includeFrontmatter?: boolean;
	filename?: string;
}