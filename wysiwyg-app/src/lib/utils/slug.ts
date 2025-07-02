/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.trim()
		// Replace spaces with hyphens
		.replace(/\s+/g, '-')
		// Remove special characters except hyphens
		.replace(/[^a-z0-9-]/g, '')
		// Replace multiple hyphens with single hyphen
		.replace(/-+/g, '-')
		// Remove hyphens from start and end
		.replace(/^-+|-+$/g, '');
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
	// Must be lowercase, contain only letters, numbers, and hyphens
	// Cannot start or end with hyphen
	// Must be between 3-100 characters
	const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
	return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
}

/**
 * Check if slug already exists (placeholder - would check against database)
 */
export function isSlugUnique(slug: string, existingSlugs: string[]): boolean {
	return !existingSlugs.includes(slug);
}

/**
 * Generate unique slug by appending number if needed
 */
export function generateUniqueSlug(title: string, existingSlugs: string[]): string {
	let baseSlug = generateSlug(title);
	let slug = baseSlug;
	let counter = 1;
	
	while (!isSlugUnique(slug, existingSlugs)) {
		slug = `${baseSlug}-${counter}`;
		counter++;
	}
	
	return slug;
}