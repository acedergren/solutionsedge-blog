import type { BlogPost, BlogPostMetadata, ValidationError } from '$lib/types/blog';
import { isValidSlug } from './slug';

/**
 * Validate blog post metadata
 */
export function validateMetadata(metadata: Partial<BlogPostMetadata>): ValidationError[] {
	const errors: ValidationError[] = [];
	
	// Title validation
	if (!metadata.title) {
		errors.push({ field: 'title', message: 'Title is required' });
	} else if (metadata.title.length < 3) {
		errors.push({ field: 'title', message: 'Title must be at least 3 characters long' });
	} else if (metadata.title.length > 200) {
		errors.push({ field: 'title', message: 'Title must be less than 200 characters' });
	}
	
	// Slug validation
	if (!metadata.slug) {
		errors.push({ field: 'slug', message: 'Slug is required' });
	} else if (!isValidSlug(metadata.slug)) {
		errors.push({ field: 'slug', message: 'Slug must be lowercase, contain only letters, numbers, and hyphens' });
	}
	
	// Author validation
	if (!metadata.author) {
		errors.push({ field: 'author', message: 'Author is required' });
	} else if (metadata.author.length < 2) {
		errors.push({ field: 'author', message: 'Author name must be at least 2 characters long' });
	} else if (metadata.author.length > 100) {
		errors.push({ field: 'author', message: 'Author name must be less than 100 characters' });
	}
	
	// Publish date validation
	if (!metadata.publishDate) {
		errors.push({ field: 'publishDate', message: 'Publish date is required' });
	} else if (!(metadata.publishDate instanceof Date)) {
		errors.push({ field: 'publishDate', message: 'Publish date must be a valid date' });
	}
	
	// Tags validation
	if (!metadata.tags || !Array.isArray(metadata.tags)) {
		errors.push({ field: 'tags', message: 'Tags must be an array' });
	} else if (metadata.tags.length === 0) {
		errors.push({ field: 'tags', message: 'At least one tag is required' });
	} else if (metadata.tags.length > 10) {
		errors.push({ field: 'tags', message: 'Maximum 10 tags allowed' });
	} else {
		// Validate individual tags
		metadata.tags.forEach((tag, index) => {
			if (typeof tag !== 'string') {
				errors.push({ field: `tags[${index}]`, message: 'Tag must be a string' });
			} else if (tag.length < 2) {
				errors.push({ field: `tags[${index}]`, message: 'Tag must be at least 2 characters long' });
			} else if (tag.length > 30) {
				errors.push({ field: `tags[${index}]`, message: 'Tag must be less than 30 characters' });
			}
		});
	}
	
	// Excerpt validation
	if (!metadata.excerpt) {
		errors.push({ field: 'excerpt', message: 'Excerpt is required' });
	} else if (metadata.excerpt.length < 10) {
		errors.push({ field: 'excerpt', message: 'Excerpt must be at least 10 characters long' });
	} else if (metadata.excerpt.length > 300) {
		errors.push({ field: 'excerpt', message: 'Excerpt must be less than 300 characters' });
	}
	
	// Cover image validation (optional)
	if (metadata.coverImage && metadata.coverImage.length > 500) {
		errors.push({ field: 'coverImage', message: 'Cover image URL must be less than 500 characters' });
	}
	
	return errors;
}

/**
 * Validate content
 */
export function validateContent(content: string): ValidationError[] {
	const errors: ValidationError[] = [];
	
	if (!content || content.trim().length === 0) {
		errors.push({ field: 'content', message: 'Content is required' });
	} else if (content.trim().length < 50) {
		errors.push({ field: 'content', message: 'Content must be at least 50 characters long' });
	} else if (content.length > 100000) {
		errors.push({ field: 'content', message: 'Content must be less than 100,000 characters' });
	}
	
	return errors;
}

/**
 * Check if all required fields are filled
 */
export function hasRequiredFields(metadata: Partial<BlogPostMetadata>): boolean {
	return !!(
		metadata.title &&
		metadata.slug &&
		metadata.author &&
		metadata.publishDate &&
		metadata.tags &&
		metadata.tags.length > 0 &&
		metadata.excerpt
	);
}

/**
 * Validate if a post is ready for publishing
 */
export function validatePublishReady(post: BlogPost): ValidationError[] {
	const errors: ValidationError[] = [];
	
	// Check title
	if (!post.title || post.title.trim().length === 0) {
		errors.push({ field: 'title', message: 'Title is required' });
	}
	
	// Check excerpt
	if (!post.excerpt || post.excerpt.trim().length === 0) {
		errors.push({ field: 'excerpt', message: 'Excerpt is required for SEO' });
	}
	
	// Check tags
	if (!post.tags || post.tags.length === 0) {
		errors.push({ field: 'tags', message: 'At least one tag is required' });
	}
	
	// Check content length
	if (!post.content || post.content.trim().length < 100) {
		errors.push({ field: 'content', message: 'Content is too short (minimum 100 characters)' });
	}
	
	// Warning for missing cover image (not an error)
	// This is handled in the UI as a warning, not a blocking error
	
	return errors;
}