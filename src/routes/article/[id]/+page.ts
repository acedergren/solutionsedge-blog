import type { PageLoad } from './$types';
import { getAllArticles, getArticleById } from '$lib/content';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({ params }) => {
	const article = getArticleById(params.id);
	
	if (!article) {
		throw error(404, 'Article not found');
	}
	
	return {
		article
	};
};

// Define which article pages to prerender
export function entries() {
	// Dynamically return all article IDs from the content system
	const articles = getAllArticles();
	return articles.map(article => ({ id: article.id }));
}