import { getAllPosts, getCategories } from '$lib/content.js';

export async function load() {
  const posts = getAllPosts();
  const categories = getCategories();

  return {
    posts,
    categories
  };
}