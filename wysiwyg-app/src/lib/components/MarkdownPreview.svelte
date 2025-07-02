<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import type { BlogPost } from '$lib/types/blog';
	
	export let post: BlogPost;
	export let showFrontmatter = true;
	export let showRendered = true;
	
	$: markdownContent = generateMarkdownPreview();
	$: renderedContent = showRendered ? renderMarkdown(post.content) : '';
	
	function generateMarkdownPreview(): string {
		let preview = '';
		
		if (showFrontmatter) {
			preview += '---\n';
			preview += `title: ${post.title}\n`;
			preview += `slug: ${post.slug}\n`;
			preview += `author: ${post.author}\n`;
			preview += `publishDate: ${post.publishDate.toISOString()}\n`;
			preview += `tags: [${post.tags.map(tag => `"${tag}"`).join(', ')}]\n`;
			preview += `excerpt: "${post.excerpt}"\n`;
			if (post.featured !== undefined) preview += `featured: ${post.featured}\n`;
			if (post.draft !== undefined) preview += `draft: ${post.draft}\n`;
			if (post.coverImage) preview += `coverImage: ${post.coverImage}\n`;
			preview += '---\n\n';
		}
		
		preview += post.content;
		
		return preview;
	}
	
	function renderMarkdown(markdown: string): string {
		const html = marked(markdown);
		return DOMPurify.sanitize(html as string);
	}
	
	function copyToClipboard() {
		navigator.clipboard.writeText(markdownContent);
		// Show notification
		const notification = document.createElement('div');
		notification.className = 'notification fixed top-4 right-4 bg-success-600 text-white px-4 py-2 rounded-lg shadow-elevation-3 animate-slide-down';
		notification.textContent = 'Copied to clipboard!';
		document.body.appendChild(notification);
		
		setTimeout(() => {
			notification.classList.add('animate-fade-out');
			setTimeout(() => notification.remove(), 200);
		}, 2000);
	}
</script>

<div class="markdown-preview-container bg-surface rounded-xl shadow-elevation-2 overflow-hidden">
	<div class="preview-header bg-surface-container-low border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
		<h3 class="text-headline-small font-medium text-secondary-800">Markdown Preview</h3>
		<div class="flex items-center gap-2">
			<label class="flex items-center gap-2 text-body-medium text-secondary-600">
				<input 
					type="checkbox" 
					bind:checked={showFrontmatter}
					class="rounded border-secondary-300 text-primary focus:ring-primary"
				>
				Show Frontmatter
			</label>
			<label class="flex items-center gap-2 text-body-medium text-secondary-600">
				<input 
					type="checkbox" 
					bind:checked={showRendered}
					class="rounded border-secondary-300 text-primary focus:ring-primary"
				>
				Show Rendered
			</label>
			<button 
				on:click={copyToClipboard}
				class="editor-button"
				title="Copy to clipboard"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
				</svg>
			</button>
		</div>
	</div>
	
	<div class="preview-content p-6 overflow-auto max-h-[600px] scrollbar-thin">
		{#if showRendered}
			<div class="prose prose-lg max-w-none">
				{@html renderedContent}
			</div>
		{:else}
			<pre class="bg-secondary-100 p-4 rounded-lg overflow-x-auto text-body-medium font-mono whitespace-pre-wrap">{markdownContent}</pre>
		{/if}
	</div>
	
	<div class="preview-footer bg-surface-container-low border-t border-secondary-200 px-6 py-3">
		<div class="flex items-center justify-between text-body-small text-secondary-600">
			<span>{post.content.split(/\s+/).length} words</span>
			<span>{Math.ceil(post.content.split(/\s+/).length / 200)} min read</span>
		</div>
	</div>
</div>

<style>
	.markdown-preview-container {
		min-height: 300px;
	}
	
	:global(.markdown-preview-container .prose h1) {
		@apply text-display-small font-medium text-secondary-900 mb-6 mt-8;
	}
	
	:global(.markdown-preview-container .prose h2) {
		@apply text-headline-large font-medium text-secondary-900 mb-4 mt-6;
	}
	
	:global(.markdown-preview-container .prose h3) {
		@apply text-headline-medium font-medium text-secondary-900 mb-3 mt-5;
	}
	
	:global(.markdown-preview-container .prose p) {
		@apply text-body-large leading-relaxed mb-4;
	}
	
	:global(.markdown-preview-container .prose a) {
		@apply text-primary-600 hover:text-primary-700 transition-colors duration-200;
	}
	
	:global(.markdown-preview-container .prose code) {
		@apply bg-secondary-100 text-secondary-800 px-1.5 py-0.5 rounded text-sm font-mono;
	}
	
	:global(.markdown-preview-container .prose pre) {
		@apply bg-secondary-900 text-secondary-100 rounded-xl shadow-elevation-1 p-4;
	}
	
	:global(.markdown-preview-container .prose blockquote) {
		@apply border-l-4 border-primary-300 bg-primary-50 pl-4 py-1 italic;
	}
	
	:global(.markdown-preview-container .prose img) {
		@apply rounded-xl shadow-elevation-2 mx-auto;
	}
	
	:global(.markdown-preview-container .prose ul) {
		@apply list-disc pl-6 mb-4;
	}
	
	:global(.markdown-preview-container .prose ol) {
		@apply list-decimal pl-6 mb-4;
	}
	
	:global(.markdown-preview-container .prose li) {
		@apply mb-2;
	}
</style>