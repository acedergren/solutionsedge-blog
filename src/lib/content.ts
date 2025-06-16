import type { Article } from './types';

// Import all markdown files
const articleModules = import.meta.glob('/src/content/articles/*.md', { 
  eager: true,
  as: 'raw'
});

export function parseMarkdown(content: string): { metadata: any; content: string } {
  const metadataRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(metadataRegex);
  
  if (!match) {
    return { metadata: {}, content };
  }
  
  const [, metadataStr, markdownContent] = match;
  const metadata: any = {};
  
  // Parse YAML-like metadata
  metadataStr.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      const value = valueParts.join(':').trim();
      // Remove quotes if present
      metadata[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  });
  
  // Parse arrays
  if (metadata.tags) {
    metadata.tags = metadata.tags
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((tag: string) => tag.trim().replace(/^["']|["']$/g, ''));
  }
  
  // Parse numbers
  if (metadata.readingTime) {
    metadata.readingTime = parseInt(metadata.readingTime);
  }
  
  // Parse dates - keep as string for article processing
  // if (metadata.date) {
  //   metadata.date = new Date(metadata.date);
  // }
  
  // Parse booleans
  if (metadata.featured) {
    metadata.featured = metadata.featured === 'true';
  }
  
  return { metadata, content: markdownContent };
}

export function getAllArticles(): Article[] {
  const articles: Article[] = [];
  
  for (const [path, content] of Object.entries(articleModules)) {
    const { metadata, content: markdownContent } = parseMarkdown(content as string);
    
    // Extract filename without extension from path to use as ID
    const filename = path.split('/').pop()?.replace('.md', '') || 'unknown';
    
    articles.push({
      id: filename,
      title: metadata.title || 'Untitled',
      excerpt: metadata.description || metadata.excerpt || '',
      content: markdownContent,
      author: {
        name: metadata.author || 'Anonymous',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(metadata.author || 'Anonymous')}&background=1a8917&color=fff`,
        bio: 'Solutions Engineer specializing in cloud and edge computing'
      },
      publishedAt: new Date(metadata.date || '2024-01-01'),
      readingTime: metadata.readingTime || 5,
      tags: metadata.tags || [],
      imageUrl: metadata.imageUrl || `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 100)}`,
      featured: metadata.featured || false
    });
  }
  
  return articles.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find(article => article.id === id);
}

export function getArticlesByTag(tag: string): Article[] {
  return getAllArticles().filter(article => 
    article.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function getFeaturedArticles(): Article[] {
  return getAllArticles().filter(article => article.featured);
}