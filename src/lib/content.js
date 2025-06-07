import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import { format } from 'date-fns';

const CONTENT_DIR = 'src/content';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function parsePelicanMetadata(content) {
  const lines = content.split('\n');
  const metadata = {};
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      metadata[key.toLowerCase().trim()] = value;
    } else if (line.trim() === '') {
      contentStart = i + 1;
      break;
    }
  }

  const bodyContent = lines.slice(contentStart).join('\n');
  return { metadata, content: bodyContent };
}

export function getAllPosts() {
  const posts = [];

  function walkDir(dir, category = null) {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);
      const stat = statSync(filePath);

      if (stat.isDirectory()) {
        // Use directory name as category
        const newCategory = category || file;
        walkDir(filePath, newCategory);
      } else if (file.endsWith('.md') && file !== 'README.md') {
        const content = readFileSync(filePath, 'utf-8');
        const { metadata, content: body } = parsePelicanMetadata(content);

        // Generate slug from title
        const slug = slugify(metadata.title || file.replace('.md', ''));

        // Parse date
        let date = new Date();
        if (metadata.date) {
          date = new Date(metadata.date);
        }

        posts.push({
          slug,
          title: metadata.title || file.replace('.md', ''),
          date: date.toISOString(),
          category: metadata.category || category || 'uncategorized',
          excerpt: body.substring(0, 200).replace(/\n/g, ' ').trim() + '...',
          content: body,
          readingTime: Math.ceil(body.split(' ').length / 200)
        });
      }
    }
  }

  walkDir(CONTENT_DIR);

  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPost(slug) {
  const posts = getAllPosts();
  return posts.find(post => post.slug === slug);
}

export function getCategories() {
  const posts = getAllPosts();
  const categories = {};

  posts.forEach(post => {
    const category = post.category;
    if (!categories[category]) {
      categories[category] = {
        name: category,
        slug: slugify(category),
        count: 0
      };
    }
    categories[category].count++;
  });

  return Object.values(categories);
}

export function getPostsByCategory(categorySlug) {
  const posts = getAllPosts();
  return posts.filter(post => slugify(post.category) === categorySlug);
}

export function renderMarkdown(content) {
  return marked(content);
}