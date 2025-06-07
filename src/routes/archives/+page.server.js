import { getAllPosts } from '$lib/content.js';

export async function load() {
  const posts = getAllPosts();
  
  // Group posts by year
  const postsByYear = {};
  posts.forEach(post => {
    const year = new Date(post.date).getFullYear();
    if (!postsByYear[year]) {
      postsByYear[year] = [];
    }
    postsByYear[year].push(post);
  });

  return {
    postsByYear
  };
}