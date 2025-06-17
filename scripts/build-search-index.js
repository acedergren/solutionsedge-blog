#!/usr/bin/env node

/**
 * Search Index Builder
 * 
 * Builds a comprehensive search index from all content and uploads it to EdgeKV.
 * This script should be run during the build process to keep the search index current.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllArticles } from '../src/lib/content.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Search index builder configuration
 */
const CONFIG = {
  outputFile: path.join(__dirname, '../static/search-index.json'),
  minTermLength: 3,
  maxTermLength: 50,
  ngramSize: 3,
  stopWords: new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'within', 'without',
    'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we',
    'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself',
    'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
    'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs',
    'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
    'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall'
  ])
};

/**
 * Build search index from all content
 */
async function buildSearchIndex() {
  console.log('🔍 Building search index...');
  
  const startTime = Date.now();
  
  try {
    // Get all articles
    const articles = getAllArticles();
    console.log(`📄 Found ${articles.length} articles to index`);
    
    // Create searchable documents
    const documents = {};
    const keywords = {};
    const ngrams = {};
    const tags = {};
    const autocomplete = {};
    
    let documentCount = 0;
    
    for (const article of articles) {
      const doc = createSearchableDocument(article);
      documents[doc.id] = doc;
      
      // Index document content
      indexDocument(doc, keywords, ngrams, tags, autocomplete);
      documentCount++;
      
      if (documentCount % 10 === 0) {
        console.log(`📝 Indexed ${documentCount} documents...`);
      }
    }
    
    // Add static pages
    const staticPages = getStaticPages();
    for (const page of staticPages) {
      const doc = createSearchableDocument(page);
      documents[doc.id] = doc;
      indexDocument(doc, keywords, ngrams, tags, autocomplete);
      documentCount++;
    }
    
    // Build final index
    const searchIndex = {
      documents,
      keywords,
      ngrams,
      tags,
      autocomplete,
      metadata: {
        version: '1.0.0',
        totalDocuments: documentCount,
        lastUpdated: new Date().toISOString(),
        buildTime: Date.now() - startTime
      }
    };
    
    // Write to file
    const indexJson = JSON.stringify(searchIndex, null, 2);
    fs.writeFileSync(CONFIG.outputFile, indexJson);
    
    const sizeKB = Math.round(Buffer.byteLength(indexJson, 'utf8') / 1024);
    console.log(`✅ Search index built successfully!`);
    console.log(`📊 Statistics:`);
    console.log(`   - Documents: ${documentCount}`);
    console.log(`   - Keywords: ${Object.keys(keywords).length}`);
    console.log(`   - N-grams: ${Object.keys(ngrams).length}`);
    console.log(`   - Tags: ${Object.keys(tags).length}`);
    console.log(`   - Autocomplete: ${Object.keys(autocomplete).length}`);
    console.log(`   - Index size: ${sizeKB} KB`);
    console.log(`   - Build time: ${Date.now() - startTime}ms`);
    console.log(`   - Output: ${CONFIG.outputFile}`);
    
    return searchIndex;
    
  } catch (error) {
    console.error('❌ Failed to build search index:', error);
    process.exit(1);
  }
}

/**
 * Create a searchable document from article data
 */
function createSearchableDocument(article) {
  return {
    id: article.id,
    title: article.title,
    content: article.content || article.excerpt || '',
    excerpt: article.excerpt || '',
    tags: article.tags || [],
    author: article.author || 'Solutions Edge',
    date: article.date || new Date().toISOString(),
    url: `/article/${article.id}`,
    type: article.type || 'article',
    boost: calculateDocumentBoost(article)
  };
}

/**
 * Calculate boost factor for document ranking
 */
function calculateDocumentBoost(article) {
  let boost = 1.0;
  
  // Boost recent articles
  const daysSincePublished = (Date.now() - new Date(article.date || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 30) boost += 0.5;  // Recent articles
  if (daysSincePublished < 7) boost += 0.3;   // Very recent articles
  
  // Boost articles with more tags (indicates comprehensive content)
  if (article.tags && article.tags.length > 3) boost += 0.2;
  
  // Boost featured or important content
  if (article.tags && article.tags.includes('featured')) boost += 0.5;
  if (article.tags && article.tags.includes('tutorial')) boost += 0.3;
  if (article.tags && article.tags.includes('guide')) boost += 0.3;
  
  return Math.min(boost, 3.0); // Cap boost at 3x
}

/**
 * Index a document's content
 */
function indexDocument(doc, keywords, ngrams, tags, autocomplete) {
  // Index title (highest priority)
  const titleTerms = tokenize(doc.title);
  indexTerms(titleTerms, doc.id, keywords);
  addToAutocomplete(doc.title, 'title', 10, autocomplete, doc.id);
  
  // Index content
  const contentTerms = tokenize(doc.content);
  indexTerms(contentTerms, doc.id, keywords);
  
  // Index excerpt
  const excerptTerms = tokenize(doc.excerpt);
  indexTerms(excerptTerms, doc.id, keywords);
  
  // Index tags
  for (const tag of doc.tags) {
    const normalizedTag = normalizeText(tag);
    if (!tags[normalizedTag]) tags[normalizedTag] = [];
    if (!tags[normalizedTag].includes(doc.id)) {
      tags[normalizedTag].push(doc.id);
    }
    addToAutocomplete(tag, 'tag', 8, autocomplete);
  }
  
  // Index author
  addToAutocomplete(doc.author, 'author', 5, autocomplete);
  
  // Generate n-grams for partial matching
  const allTerms = [...titleTerms, ...contentTerms, ...excerptTerms];
  for (const term of allTerms) {
    const termNgrams = generateNgrams(term, CONFIG.ngramSize);
    for (const ngram of termNgrams) {
      if (!ngrams[ngram]) ngrams[ngram] = [];
      if (!ngrams[ngram].includes(doc.id)) {
        ngrams[ngram].push(doc.id);
      }
    }
  }
}

/**
 * Index terms for keyword search
 */
function indexTerms(terms, docId, keywords) {
  for (const term of terms) {
    if (!keywords[term]) keywords[term] = [];
    if (!keywords[term].includes(docId)) {
      keywords[term].push(docId);
    }
  }
}

/**
 * Add entry to autocomplete index
 */
function addToAutocomplete(text, type, weight, autocomplete, documentId = null) {
  const normalized = normalizeText(text);
  const prefixes = generatePrefixes(normalized);
  
  for (const prefix of prefixes) {
    if (prefix.length < 2) continue;
    
    if (!autocomplete[prefix]) autocomplete[prefix] = [];
    
    const entry = {
      text: text,
      type: type,
      weight: weight,
      ...(documentId && { documentId })
    };
    
    // Avoid duplicates
    const exists = autocomplete[prefix].some(existing => 
      existing.text === entry.text && existing.type === entry.type
    );
    
    if (!exists) {
      autocomplete[prefix].push(entry);
    }
  }
}

/**
 * Generate prefixes for autocomplete
 */
function generatePrefixes(text) {
  const prefixes = [];
  for (let i = 2; i <= text.length; i++) {
    prefixes.push(text.substring(0, i));
  }
  return prefixes;
}

/**
 * Generate n-grams from text
 */
function generateNgrams(text, n) {
  const ngrams = [];
  const normalized = normalizeText(text);
  
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.push(normalized.substring(i, i + n));
  }
  
  return ngrams;
}

/**
 * Tokenize text into searchable terms
 */
function tokenize(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter(term => 
      term.length >= CONFIG.minTermLength && 
      term.length <= CONFIG.maxTermLength &&
      !CONFIG.stopWords.has(term.toLowerCase())
    );
}

/**
 * Normalize text for consistent indexing
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')      // Normalize whitespace
    .trim();
}

/**
 * Get static pages to include in search
 */
function getStaticPages() {
  return [
    {
      id: 'about',
      title: 'About The Solutions Edge',
      content: 'The Solutions Edge is a technical blog focusing on cloud computing, edge technologies, and modern infrastructure solutions through real-world experiences and technical insights.',
      excerpt: 'Learn about The Solutions Edge blog and Alexander Cedergren\'s expertise in cloud computing and edge technologies.',
      tags: ['about', 'cloud', 'edge-computing', 'infrastructure'],
      author: 'Alexander Cedergren',
      date: new Date().toISOString(),
      type: 'page'
    },
    {
      id: 'topics',
      title: 'Topics - The Solutions Edge',
      content: 'Explore topics covering cloud infrastructure, edge computing, Kubernetes, DevOps, security, AI/ML, and automation technologies.',
      excerpt: 'Browse all topics and categories covered on The Solutions Edge blog.',
      tags: ['topics', 'categories', 'cloud', 'kubernetes', 'devops', 'security'],
      author: 'Solutions Edge',
      date: new Date().toISOString(),
      type: 'page'
    }
  ];
}

/**
 * Upload search index to EdgeKV (if credentials available)
 */
async function uploadToEdgeKV(searchIndex) {
  try {
    // This would require Akamai CLI to be configured
    console.log('📤 Uploading search index to EdgeKV...');
    
    // For now, just save instructions
    const instructions = `
# Upload Search Index to EdgeKV

To upload the search index to EdgeKV, run:

\`\`\`bash
# Install Akamai CLI (if not already installed)
npm install -g @akamai/cli
akamai install edgeworkers

# Upload search index
akamai edgekv write search_index "$(cat static/search-index.json)" --namespace solutionsedge --group search

# Verify upload
akamai edgekv read search_index --namespace solutionsedge --group search | jq '.metadata'
\`\`\`

The search index is ready for EdgeWorkers!
`;
    
    fs.writeFileSync(path.join(__dirname, '../static/search-upload-instructions.txt'), instructions);
    console.log('📋 Upload instructions saved to static/search-upload-instructions.txt');
    
  } catch (error) {
    console.warn('⚠️  Could not upload to EdgeKV:', error.message);
    console.log('💡 Run the upload manually using Akamai CLI');
  }
}

// Run the build if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildSearchIndex()
    .then(searchIndex => {
      return uploadToEdgeKV(searchIndex);
    })
    .then(() => {
      console.log('🎉 Search index build completed!');
    })
    .catch(console.error);
}

export { buildSearchIndex };