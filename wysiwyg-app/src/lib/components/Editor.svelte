<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import type { QuillOptions } from 'quill';
	import { marked } from 'marked';
	
	export let content = '';
	
	const dispatch = createEventDispatcher();
	
	let Quill: any;
	let TurndownService: any;
	let DOMPurify: any;
	let turndownService: any;
	
	let editor: HTMLDivElement;
	let preview: HTMLDivElement;
	let quill: Quill;
	let wordCount = 0;
	let readingTime = 0;
	let isPreviewVisible = true;
	let isFullscreen = false;
	let resizing = false;
	let editorWidth = 50;
	
	const toolbarOptions = [
		[{ 'header': [1, 2, 3, false] }],
		['bold', 'italic', 'underline'],
		[{ 'list': 'ordered'}, { 'list': 'bullet' }],
		['link', 'image', 'code-block'],
		['clean']
	];
	
	const quillOptions: QuillOptions = {
		theme: 'snow',
		modules: {
			toolbar: toolbarOptions
		},
		placeholder: 'Start writing your content...'
	};
	
	onMount(async () => {
		if (browser) {
			// Dynamically import modules to avoid SSR issues
			const [QuillModule, TurndownModule, DOMPurifyModule] = await Promise.all([
				import('quill'),
				import('turndown'),
				import('dompurify')
			]);
			
			Quill = QuillModule.default;
			TurndownService = TurndownModule.default;
			DOMPurify = DOMPurifyModule.default;
			
			turndownService = new TurndownService({
				headingStyle: 'atx',
				codeBlockStyle: 'fenced'
			});
			
			// Initialize Quill
			quill = new Quill(editor, quillOptions);
			
			// Set initial content if provided
			if (content) {
				quill.root.innerHTML = content;
				updatePreview();
			}
			
			// Listen for text changes
			quill.on('text-change', () => {
				const html = quill.root.innerHTML;
				content = html;
				updatePreview();
				updateStats();
				dispatch('change', html);
			});
			
			// Handle image uploads
			quill.getModule('toolbar').addHandler('image', () => {
				const range = quill.getSelection();
				if (range) {
					// Placeholder for image upload
					const url = prompt('Enter image URL (S3 upload will be implemented):');
					if (url) {
						quill.insertEmbed(range.index, 'image', url);
					}
				}
			});
		}
	});
	
	onDestroy(() => {
		if (quill) {
			quill = null as any;
		}
	});
	
	function updatePreview() {
		if (!browser || !preview || !turndownService || !DOMPurify) return;
		
		// Convert HTML to Markdown
		const markdown = turndownService.turndown(content);
		
		// Convert Markdown back to HTML for preview
		const previewHtml = marked(markdown);
		
		// Sanitize HTML
		const sanitizedHtml = DOMPurify.sanitize(previewHtml as string);
		
		preview.innerHTML = sanitizedHtml;
	}
	
	function updateStats() {
		if (!quill) return;
		const text = quill.getText();
		const words = text.trim().split(/\s+/).filter(word => word.length > 0);
		wordCount = words.length;
		readingTime = Math.max(1, Math.ceil(wordCount / 200)); // Average reading speed: 200 words/min
	}
	
	function togglePreview() {
		isPreviewVisible = !isPreviewVisible;
	}
	
	function toggleFullscreen() {
		isFullscreen = !isFullscreen;
		if (isFullscreen) {
			document.documentElement.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}
	
	function getMarkdown(): string {
		return turndownService.turndown(content);
	}
	
	function handleResizeStart(e: MouseEvent) {
		resizing = true;
		document.addEventListener('mousemove', handleResize);
		document.addEventListener('mouseup', handleResizeEnd);
	}
	
	function handleResize(e: MouseEvent) {
		if (!resizing) return;
		const container = document.querySelector('.editor-container') as HTMLElement;
		if (!container) return;
		
		const containerRect = container.getBoundingClientRect();
		const percentage = ((e.clientX - containerRect.left) / containerRect.width) * 100;
		editorWidth = Math.min(80, Math.max(20, percentage));
	}
	
	function handleResizeEnd() {
		resizing = false;
		document.removeEventListener('mousemove', handleResize);
		document.removeEventListener('mouseup', handleResizeEnd);
	}
	
	// Export function for parent components
	export { getMarkdown };
</script>

<div class="editor-container flex h-full bg-surface-container-lowest {isFullscreen ? 'fixed inset-0 z-50' : ''} {resizing ? 'select-none' : ''}">
	<!-- Editor Panel -->
	<div class="editor-panel bg-surface flex flex-col shadow-elevation-2" style="width: {isPreviewVisible ? editorWidth + '%' : '100%'}">
		<!-- Toolbar -->
		<div class="editor-toolbar bg-surface-container-low border-b border-secondary-200 p-2 flex items-center justify-between">
			<div class="flex items-center gap-1" id="toolbar">
				<!-- Quill toolbar will be inserted here -->
			</div>
			<div class="flex items-center gap-2">
				<button 
					class="editor-button"
					on:click={toggleFullscreen}
					title="{isFullscreen ? 'Exit' : 'Enter'} fullscreen"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if isFullscreen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
						{/if}
					</svg>
				</button>
				<button 
					class="editor-button"
					on:click={togglePreview}
					title="{isPreviewVisible ? 'Hide' : 'Show'} preview"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if isPreviewVisible}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						{/if}
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Editor Content -->
		<div class="flex-1 overflow-hidden">
			<div bind:this={editor} class="h-full"></div>
		</div>
		
		<!-- Status Bar -->
		<div class="bg-surface-container-low border-t border-secondary-200 px-4 py-2 flex items-center justify-between text-body-small text-secondary-600">
			<div class="flex items-center gap-4">
				<span class="flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
					</svg>
					{wordCount} words
				</span>
				<span class="flex items-center gap-1">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
					{readingTime} min read
				</span>
			</div>
			<div class="text-secondary-500">
				Auto-saving enabled
			</div>
		</div>
	</div>
	
	<!-- Resize Handle -->
	{#if isPreviewVisible}
		<div 
			class="resize-handle w-1 bg-secondary-200 hover:bg-primary-400 cursor-col-resize transition-colors duration-200"
			on:mousedown={handleResizeStart}
			role="separator"
			aria-orientation="vertical"
		/>
	{/if}
	
	<!-- Preview Panel -->
	{#if isPreviewVisible}
		<div class="preview-panel flex-1 bg-surface-dim flex flex-col animate-slide-in-right">
			<!-- Preview Header -->
			<div class="bg-surface-container-low border-b border-secondary-200 px-6 py-4">
				<h3 class="text-headline-small font-medium text-secondary-800">Markdown Preview</h3>
			</div>
			
			<!-- Preview Content -->
			<div bind:this={preview} class="flex-1 overflow-y-auto px-8 py-6 prose prose-lg max-w-none scrollbar-thin">
				<!-- Markdown content will be rendered here -->
			</div>
		</div>
	{/if}
</div>

<style>
	:global(.editor-container .ql-toolbar) {
		border: none !important;
		padding: 0 !important;
	}
	
	:global(.editor-container .ql-container) {
		border: none !important;
		font-size: 16px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
	}
	
	:global(.editor-container .ql-editor) {
		padding: 2rem;
		line-height: 1.8;
		min-height: 100%;
	}
	
	:global(.editor-container .ql-editor.ql-blank::before) {
		color: theme('colors.secondary.400');
		font-style: normal;
		left: 2rem;
		right: 2rem;
	}
	
	:global(.editor-container .ql-snow .ql-toolbar button) {
		@apply rounded-lg transition-all duration-200 ease-material-standard;
		width: 32px;
		height: 32px;
		margin: 2px;
	}
	
	:global(.editor-container .ql-snow .ql-toolbar button:hover) {
		@apply bg-secondary-100;
	}
	
	:global(.editor-container .ql-snow .ql-toolbar button.ql-active) {
		@apply bg-primary-100 text-primary-700;
	}
	
	:global(.editor-container .ql-snow .ql-picker) {
		@apply text-secondary-700;
	}
	
	:global(.editor-container .ql-snow .ql-picker-options) {
		@apply bg-surface shadow-elevation-3 rounded-lg border-0 p-1;
	}
	
	:global(.editor-container .ql-snow .ql-picker-item) {
		@apply rounded px-2 py-1 transition-colors duration-200;
	}
	
	:global(.editor-container .ql-snow .ql-picker-item:hover) {
		@apply bg-secondary-100;
	}
	
	/* Markdown preview styles */
	:global(.preview-panel .prose) {
		@apply text-secondary-800;
	}
	
	:global(.preview-panel .prose h1) {
		@apply text-display-small font-medium text-secondary-900 mb-6 mt-8;
	}
	
	:global(.preview-panel .prose h2) {
		@apply text-headline-large font-medium text-secondary-900 mb-4 mt-6;
	}
	
	:global(.preview-panel .prose h3) {
		@apply text-headline-medium font-medium text-secondary-900 mb-3 mt-5;
	}
	
	:global(.preview-panel .prose p) {
		@apply text-body-large leading-relaxed mb-4;
	}
	
	:global(.preview-panel .prose a) {
		@apply text-primary-600 hover:text-primary-700 transition-colors duration-200;
	}
	
	:global(.preview-panel .prose code) {
		@apply bg-secondary-100 text-secondary-800 px-1.5 py-0.5 rounded text-sm font-mono;
	}
	
	:global(.preview-panel .prose pre) {
		@apply bg-secondary-900 text-secondary-100 rounded-xl shadow-elevation-1;
	}
	
	:global(.preview-panel .prose blockquote) {
		@apply border-l-4 border-primary-300 bg-primary-50 py-1 italic;
	}
	
	:global(.preview-panel .prose img) {
		@apply rounded-xl shadow-elevation-2;
	}
	
	/* Animations */
	@keyframes slide-in-right {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	
	.animate-slide-in-right {
		animation: slide-in-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
</style>