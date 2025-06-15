import type { PageLoad } from './$types';
import { getAllArticles } from '$lib/content';

export const load: PageLoad = ({ params }) => {
	return {
		slug: params.slug
	};
};

// Define which topic pages to prerender
export function entries() {
	// Dynamically extract all unique tags from articles
	const articles = getAllArticles();
	const uniqueTags = new Set<string>();
	
	articles.forEach(article => {
		article.tags.forEach(tag => {
			// Convert to slug format (lowercase, hyphenated)
			const slug = tag.toLowerCase().replace(/\s+/g, '-');
			uniqueTags.add(slug);
		});
	});
	
	return Array.from(uniqueTags).map(slug => ({ slug }));
}