import { getPost, renderMarkdown } from '$lib/content.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
  const post = getPost(params.slug);

  if (!post) {
    throw error(404, 'Post not found');
  }

  return {
    post: {
      ...post,
      html: renderMarkdown(post.content)
    }
  };
}

export const prerender = true;