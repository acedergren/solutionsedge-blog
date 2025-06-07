import { getAllPosts, getCategories } from '$lib/content.js';

const SITE_URL = 'https://www.solutionsedge.io';

export async function GET() {
  const posts = getAllPosts();
  const categories = getCategories();
  
  const pages = [
    { url: '/', changefreq: 'weekly', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.8 },
    { url: '/archives', changefreq: 'weekly', priority: 0.7 },
  ];
  
  // Add category pages
  categories.forEach(category => {
    pages.push({
      url: `/category/${category.slug}`,
      changefreq: 'weekly',
      priority: 0.6
    });
  });
  
  // Add blog posts
  posts.forEach(post => {
    pages.push({
      url: `/${post.slug}`,
      changefreq: 'monthly',
      priority: 0.9,
      lastmod: new Date(post.date).toISOString()
    });
  });
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.lastmod ? `
    <lastmod>${page.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
}

export const prerender = true;