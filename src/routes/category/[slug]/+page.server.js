import { getPostsByCategory, getCategories } from '$lib/content.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const posts = getPostsByCategory(params.slug);
  const categories = getCategories();
  const category = categories.find(c => c.slug === params.slug);

  if (!category) {
    throw error(404, 'Category not found');
  }

  return {
    posts,
    category
  };
}

export const prerender = true;