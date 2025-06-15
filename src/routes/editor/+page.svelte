<script lang="ts">
  import { onMount } from 'svelte';
  import type Quill from 'quill';
  import { marked } from 'marked';
  
  let editor: HTMLDivElement;
  let quill: Quill;
  let title = '';
  let author = 'Alexander Cedergren';
  let tags = '';
  let description = '';
  let excerpt = '';
  let featured = false;
  let previewMode = false;
  let htmlPreview = '';
  let markdownContent = '';
  
  onMount(async () => {
    // Dynamically import Quill to avoid SSR issues
    const { default: QuillEditor } = await import('quill');
    await import('quill/dist/quill.snow.css');
    
    quill = new QuillEditor(editor, {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      },
      placeholder: 'Write your article content here...'
    });
    
    // Update markdown content when editor changes
    quill.on('text-change', () => {
      updateMarkdown();
    });
  });
  
  function updateMarkdown() {
    if (!quill) return;
    
    const delta = quill.getContents();
    let markdown = '';
    
    delta.ops.forEach((op: any) => {
      if (typeof op.insert === 'string') {
        let text = op.insert;
        
        // Apply formatting
        if (op.attributes) {
          if (op.attributes.bold) text = `**${text}**`;
          if (op.attributes.italic) text = `*${text}*`;
          if (op.attributes.strike) text = `~~${text}~~`;
          if (op.attributes.code) text = `\`${text}\``;
          if (op.attributes.header) {
            const level = op.attributes.header;
            text = `${'#'.repeat(level)} ${text}`;
          }
          if (op.attributes.blockquote) {
            text = `> ${text}`;
          }
          if (op.attributes.list === 'ordered') {
            text = `1. ${text}`;
          }
          if (op.attributes.list === 'bullet') {
            text = `- ${text}`;
          }
        }
        
        markdown += text;
      }
    });
    
    markdownContent = markdown;
    if (previewMode) {
      htmlPreview = marked(markdown);
    }
  }
  
  function togglePreview() {
    previewMode = !previewMode;
    if (previewMode) {
      updateMarkdown();
    }
  }
  
  function generateId(): string {
    return Date.now().toString();
  }
  
  function generateFilename(): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  function downloadMarkdown() {
    const date = new Date().toISOString().split('T')[0];
    const filename = generateFilename();
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
    
    const frontmatter = `---
id: ${generateId()}
title: "${title}"
author: "${author}"
date: "${date}"
tags: [${tagArray.map(t => `"${t}"`).join(', ')}]
description: "${description}"
excerpt: "${excerpt}"
featured: ${featured}
---

`;
    
    const fullContent = frontmatter + markdownContent;
    
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  function saveToArticles() {
    const date = new Date().toISOString().split('T')[0];
    const filename = generateFilename();
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
    
    const frontmatter = `---
id: ${generateId()}
title: "${title}"
author: "${author}"
date: "${date}"
tags: [${tagArray.map(t => `"${t}"`).join(', ')}]
description: "${description}"
excerpt: "${excerpt}"
featured: ${featured}
---

`;
    
    const fullContent = frontmatter + markdownContent;
    
    // In a real implementation, this would save to the file system
    // For now, we'll just show the content that would be saved
    alert(`Article would be saved to:\n/src/content/articles/${filename}.md\n\nContent:\n${fullContent.substring(0, 500)}...`);
  }
</script>

<svelte:head>
  <title>Article Editor - The Solutions Edge</title>
</svelte:head>

<div class="min-h-screen bg-md-surface-container-low dark:bg-md-dark-surface-container-low">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold">Article Editor</h1>
      <div class="flex gap-4">
        <button
          class="md-button-tonal"
          on:click={togglePreview}
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
        <button
          class="md-button-filled"
          on:click={downloadMarkdown}
          disabled={!title || !markdownContent}
        >
          Download
        </button>
        <button
          class="md-button-filled bg-md-tertiary"
          on:click={saveToArticles}
          disabled={!title || !markdownContent}
        >
          Save to Articles
        </button>
      </div>
    </div>
    
    <!-- Article Metadata -->
    <div class="md-card mb-8 p-6">
      <h2 class="text-xl font-semibold mb-4">Article Metadata</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="title" class="block text-sm font-medium mb-2">Title *</label>
          <input
            id="title"
            type="text"
            bind:value={title}
            class="w-full px-4 py-2 border border-md-outline dark:border-md-dark-outline rounded-lg bg-md-surface dark:bg-md-dark-surface"
            placeholder="Enter article title"
          />
        </div>
        
        <div>
          <label for="author" class="block text-sm font-medium mb-2">Author</label>
          <input
            id="author"
            type="text"
            bind:value={author}
            class="w-full px-4 py-2 border border-md-outline dark:border-md-dark-outline rounded-lg bg-md-surface dark:bg-md-dark-surface"
            placeholder="Author name"
          />
        </div>
        
        <div>
          <label for="tags" class="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            bind:value={tags}
            class="w-full px-4 py-2 border border-md-outline dark:border-md-dark-outline rounded-lg bg-md-surface dark:bg-md-dark-surface"
            placeholder="Cloud, DevOps, Kubernetes"
          />
        </div>
        
        <div>
          <label for="featured" class="block text-sm font-medium mb-2">Featured Article</label>
          <div class="flex items-center mt-2">
            <input
              id="featured"
              type="checkbox"
              bind:checked={featured}
              class="w-4 h-4 text-md-primary"
            />
            <label for="featured" class="ml-2">Mark as featured</label>
          </div>
        </div>
        
        <div class="md:col-span-2">
          <label for="description" class="block text-sm font-medium mb-2">Description</label>
          <textarea
            id="description"
            bind:value={description}
            rows="2"
            class="w-full px-4 py-2 border border-md-outline dark:border-md-dark-outline rounded-lg bg-md-surface dark:bg-md-dark-surface"
            placeholder="Brief description for SEO and article cards"
          ></textarea>
        </div>
        
        <div class="md:col-span-2">
          <label for="excerpt" class="block text-sm font-medium mb-2">Excerpt</label>
          <textarea
            id="excerpt"
            bind:value={excerpt}
            rows="2"
            class="w-full px-4 py-2 border border-md-outline dark:border-md-dark-outline rounded-lg bg-md-surface dark:bg-md-dark-surface"
            placeholder="Compelling excerpt to draw readers in"
          ></textarea>
        </div>
      </div>
    </div>
    
    <!-- Content Editor -->
    <div class="md-card">
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-4">Content</h2>
        {#if !previewMode}
          <div class="editor-container">
            <div bind:this={editor} class="min-h-[400px]"></div>
          </div>
        {:else}
          <div class="prose prose-lg max-w-none dark:prose-invert">
            {@html htmlPreview}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="md-card mt-8 p-6">
      <h3 class="text-lg font-semibold mb-2">Instructions</h3>
      <ul class="list-disc list-inside space-y-1 text-sm text-md-on-surface-variant dark:text-md-dark-on-surface-variant">
        <li>Fill in the article metadata (title is required)</li>
        <li>Write your content using the rich text editor</li>
        <li>Use the Preview button to see how your article will look</li>
        <li>Download the markdown file to save locally</li>
        <li>Save to Articles to add it to the blog (requires file system access)</li>
        <li>Place the downloaded file in <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">/src/content/articles/</code></li>
      </ul>
    </div>
  </div>
</div>

<style>
  :global(.ql-container) {
    font-size: 16px;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
  
  :global(.ql-toolbar) {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  
  :global(.ql-editor) {
    min-height: 400px;
  }
  
  .editor-container {
    border-radius: 0.5rem;
    overflow: hidden;
  }
</style>