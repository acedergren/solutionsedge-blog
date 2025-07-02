<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import EditorComponent from '$lib/components/Editor.svelte';
	import MarkdownPreview from '$lib/components/MarkdownPreview.svelte';
	import S3FileBrowser from '$lib/components/S3FileBrowser.svelte';
	import UploadProgress from '$lib/components/UploadProgress.svelte';
	import PublishDialog from '$lib/components/PublishDialog.svelte';
	import { draftStore } from '$lib/stores/drafts';
	import { logger } from '$lib/logger';
	import { generateSlug, generateUniqueSlug } from '$lib/utils/slug';
	import { validateMetadata, validateContent } from '$lib/utils/validation';
	import { htmlToMarkdownSync, extractExcerpt } from '$lib/utils/markdown';
	import { exportAsMarkdown } from '$lib/utils/export';
	import { S3ClientService } from '$lib/services/s3-client';
	import type { BlogPost, BlogPostMetadata, ValidationError } from '$lib/types/blog';
	import type { S3File, UploadProgress as Progress } from '$lib/services/s3';
	
	let editorContent = '';
	let draftId: string | null = null;
	let autoSaveInterval: NodeJS.Timeout;
	let showPreview = false;
	let showS3Browser = false;
	let validationErrors: ValidationError[] = [];
	let uploadProgress: Progress | null = null;
	let showUploadProgress = false;
	let s3Files: S3File[] = [];
	let s3Loading = false;
	let s3Error: string | null = null;
	let showPublishDialog = false;
	let isScheduledPublish = false;
	let scheduledDate: Date | null = null;
	
	const s3Service = new S3ClientService();
	
	// Metadata fields
	let metadata: BlogPostMetadata = {
		title: '',
		slug: '',
		author: '',
		publishDate: new Date(),
		tags: [],
		excerpt: '',
		featured: false,
		draft: true,
		coverImage: ''
	};
	
	let tagInput = '';
	let existingSlugs: string[] = []; // Would be loaded from database
	
	// Create BlogPost object for preview
	$: blogPost = {
		...metadata,
		content: htmlToMarkdownSync(editorContent),
		htmlContent: editorContent
	} as BlogPost;
	
	onMount(() => {
		// Generate a new draft ID
		draftId = `draft_${Date.now()}`;
		logger.info('Created new draft:', draftId);
		
		// Set up S3 progress callback
		s3Service.setProgressCallback((progress) => {
			uploadProgress = progress;
			showUploadProgress = true;
			
			if (progress.percentage === 100) {
				setTimeout(() => {
					showUploadProgress = false;
					uploadProgress = null;
				}, 2000);
			}
		});
		
		// Start auto-save
		if (browser) {
			autoSaveInterval = setInterval(() => {
				if (editorContent.trim() || metadata.title) {
					saveDraft();
				}
			}, 30000); // Save every 30 seconds
		}
		
		// Load S3 files
		loadS3Files();
	});
	
	onDestroy(() => {
		if (autoSaveInterval) {
			clearInterval(autoSaveInterval);
		}
	});
	
	async function loadS3Files() {
		s3Loading = true;
		s3Error = null;
		
		const result = await s3Service.listFiles('posts/', 50);
		
		if (result.success && result.files) {
			s3Files = result.files;
		} else {
			s3Error = result.error || 'Failed to load files';
		}
		
		s3Loading = false;
	}
	
	function handleContentChange(event: CustomEvent<string>) {
		editorContent = event.detail;
		
		// Auto-generate excerpt if empty
		if (!metadata.excerpt && editorContent) {
			metadata.excerpt = extractExcerpt(editorContent);
		}
	}
	
	function handleTitleChange() {
		// Auto-generate slug from title
		if (!metadata.slug || metadata.slug === generateSlug(metadata.title.slice(0, -1))) {
			metadata.slug = generateUniqueSlug(metadata.title, existingSlugs);
		}
	}
	
	function addTag() {
		if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
			metadata.tags = [...metadata.tags, tagInput.trim()];
			tagInput = '';
		}
	}
	
	function removeTag(tag: string) {
		metadata.tags = metadata.tags.filter(t => t !== tag);
	}
	
	function saveDraft() {
		if (draftId) {
			const content = JSON.stringify({ metadata, content: editorContent });
			draftStore.saveDraft(draftId, content);
			logger.debug('Auto-saved draft with metadata');
		}
	}
	
	function handleSave() {
		// Validate before saving
		const metadataErrors = validateMetadata(metadata);
		const contentErrors = validateContent(editorContent);
		validationErrors = [...metadataErrors, ...contentErrors];
		
		if (validationErrors.length === 0) {
			saveDraft();
			logger.info('Draft saved manually');
			
			// Show success notification
			showNotification('Draft saved successfully!', 'success');
		} else {
			showNotification('Please fix validation errors', 'error');
		}
	}
	
	function handlePublishClick() {
		showPublishDialog = true;
		isScheduledPublish = false;
	}
	
	function handleScheduleClick() {
		showPublishDialog = true;
		isScheduledPublish = true;
		scheduledDate = new Date();
		scheduledDate.setHours(scheduledDate.getHours() + 1); // Default to 1 hour from now
	}
	
	async function handlePublishConfirm(event: CustomEvent) {
		const { scheduled, scheduledDate: schedDate } = event.detail;
		
		try {
			// Update post metadata
			const publishPost = {
				...blogPost,
				status: scheduled ? 'scheduled' : 'published',
				scheduledDate: schedDate,
				lastModified: new Date(),
				draft: false
			};
			
			const result = await s3Service.uploadMarkdown(publishPost);
			
			if (result.success) {
				const message = scheduled 
					? `Post scheduled for ${new Date(schedDate).toLocaleString()}!`
					: 'Post published successfully!';
				showNotification(message, 'success');
				
				// Reset form after successful publish
				if (!scheduled) {
					resetForm();
				}
				
				// Refresh S3 files list
				loadS3Files();
			} else {
				showNotification(`Publish failed: ${result.error}`, 'error');
			}
		} catch (error) {
			showNotification(`Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
		}
	}
	
	function resetForm() {
		metadata = {
			title: '',
			slug: '',
			author: '',
			publishDate: new Date(),
			tags: [],
			excerpt: '',
			featured: false,
			draft: true,
			coverImage: ''
		};
		editorContent = '';
		validationErrors = [];
	}
	
	// Legacy function for backward compatibility
	async function handleUploadToS3() {
		handlePublishClick();
	}
	
	function handleExport() {
		exportAsMarkdown(blogPost, {
			includeFrontmatter: true,
			includeHtml: false
		});
		showNotification('Markdown file downloaded!', 'success');
	}
	
	function handleS3FileSelect(file: S3File) {
		logger.info('Selected S3 file:', file.key);
		// In a real app, you could load the file content here
	}
	
	async function handleS3FileDelete(file: S3File) {
		const result = await s3Service.deleteFile(file.key);
		
		if (result.success) {
			showNotification('File deleted successfully', 'success');
			loadS3Files();
		} else {
			showNotification(`Delete failed: ${result.error}`, 'error');
		}
	}
	
	function showNotification(message: string, type: 'success' | 'error' = 'success') {
		const notification = document.createElement('div');
		notification.className = `notification fixed top-20 right-4 px-6 py-3 rounded-xl shadow-elevation-3 animate-slide-down z-50 ${
			type === 'success' ? 'bg-success-600 text-white' : 'bg-error-600 text-white'
		}`;
		notification.textContent = message;
		document.body.appendChild(notification);
		
		setTimeout(() => {
			notification.classList.add('animate-fade-out');
			setTimeout(() => notification.remove(), 200);
		}, 3000);
	}
</script>

<div class="editor-page">
	<div class="editor-header bg-surface-container-low border-b border-secondary-200 px-6 py-4">
		<div class="max-w-7xl mx-auto flex justify-between items-center">
			<h1 class="text-headline-medium font-medium text-secondary-900">New Blog Post</h1>
			<div class="flex items-center gap-3">
				<button 
					on:click={() => showS3Browser = !showS3Browser} 
					class="btn-tertiary text-sm"
				>
					{showS3Browser ? 'Hide' : 'Show'} S3 Files
				</button>
				<button 
					on:click={() => showPreview = !showPreview} 
					class="btn-secondary text-sm"
				>
					{showPreview ? 'Hide' : 'Show'} Preview
				</button>
				<button on:click={handleScheduleClick} class="btn-secondary text-sm">
					Schedule
				</button>
				<button on:click={handlePublishClick} class="btn-primary text-sm">
					Publish
				</button>
				<button on:click={handleExport} class="btn-tertiary text-sm">
					Export
				</button>
				<button on:click={handleSave} class="btn-secondary text-sm">
					Save Draft
				</button>
				<a href="/editor/drafts" class="nav-link text-sm">
					View Drafts
				</a>
			</div>
		</div>
	</div>
	
	<div class="editor-content max-w-7xl mx-auto px-6 py-6">
		{#if validationErrors.length > 0}
			<div class="bg-error-50 border border-error-200 rounded-xl p-4 mb-6 animate-slide-down">
				<h3 class="text-body-large font-medium text-error-800 mb-2">Validation Errors</h3>
				<ul class="list-disc pl-5 text-body-medium text-error-700">
					{#each validationErrors as error}
						<li>{error.field}: {error.message}</li>
					{/each}
				</ul>
			</div>
		{/if}
		
		<!-- S3 File Browser -->
		{#if showS3Browser}
			<div class="mb-6 animate-slide-down">
				<S3FileBrowser 
					files={s3Files}
					loading={s3Loading}
					error={s3Error}
					onFileSelect={handleS3FileSelect}
					onFileDelete={handleS3FileDelete}
					onRefresh={loadS3Files}
				/>
			</div>
		{/if}
		
		<!-- Metadata Section -->
		<div class="metadata-section bg-surface-container rounded-xl p-6 mb-6 shadow-elevation-1">
			<h2 class="text-headline-small font-medium text-secondary-900 mb-4">Post Metadata</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="title" class="block text-label-large text-secondary-700 mb-1">
						Title <span class="text-error-600">*</span>
					</label>
					<input 
						id="title"
						type="text" 
						bind:value={metadata.title}
						on:input={handleTitleChange}
						class="input w-full" 
						placeholder="Enter post title"
					>
				</div>
				
				<div>
					<label for="slug" class="block text-label-large text-secondary-700 mb-1">
						Slug <span class="text-error-600">*</span>
					</label>
					<input 
						id="slug"
						type="text" 
						bind:value={metadata.slug}
						class="input w-full" 
						placeholder="post-slug-here"
					>
				</div>
				
				<div>
					<label for="author" class="block text-label-large text-secondary-700 mb-1">
						Author <span class="text-error-600">*</span>
					</label>
					<input 
						id="author"
						type="text" 
						bind:value={metadata.author}
						class="input w-full" 
						placeholder="Author name"
					>
				</div>
				
				<div>
					<label for="publishDate" class="block text-label-large text-secondary-700 mb-1">
						Publish Date <span class="text-error-600">*</span>
					</label>
					<input 
						id="publishDate"
						type="datetime-local" 
						value={metadata.publishDate.toISOString().slice(0, 16)}
						on:change={(e) => metadata.publishDate = new Date(e.currentTarget.value)}
						class="input w-full"
					>
				</div>
				
				<div class="md:col-span-2">
					<label for="excerpt" class="block text-label-large text-secondary-700 mb-1">
						Excerpt <span class="text-error-600">*</span>
					</label>
					<textarea 
						id="excerpt"
						bind:value={metadata.excerpt}
						class="input w-full" 
						rows="2"
						placeholder="Brief description of the post"
					></textarea>
				</div>
				
				<div>
					<label for="coverImage" class="block text-label-large text-secondary-700 mb-1">
						Cover Image URL
					</label>
					<input 
						id="coverImage"
						type="url" 
						bind:value={metadata.coverImage}
						class="input w-full" 
						placeholder="https://example.com/image.jpg"
					>
				</div>
				
				<div>
					<label for="tags" class="block text-label-large text-secondary-700 mb-1">
						Tags <span class="text-error-600">*</span>
					</label>
					<div class="flex gap-2">
						<input 
							id="tags"
							type="text" 
							bind:value={tagInput}
							on:keydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
							class="input flex-1" 
							placeholder="Add tag and press Enter"
						>
						<button on:click={addTag} class="btn-secondary text-sm">
							Add
						</button>
					</div>
					<div class="flex flex-wrap gap-2 mt-2">
						{#each metadata.tags as tag}
							<span class="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-body-small">
								{tag}
								<button 
									on:click={() => removeTag(tag)}
									class="text-primary-600 hover:text-primary-800"
								>
									×
								</button>
							</span>
						{/each}
					</div>
				</div>
				
				<div class="flex items-center gap-4">
					<label class="flex items-center gap-2 text-body-medium text-secondary-700">
						<input 
							type="checkbox" 
							bind:checked={metadata.featured}
							class="rounded border-secondary-300 text-primary focus:ring-primary"
						>
						Featured Post
					</label>
					<label class="flex items-center gap-2 text-body-medium text-secondary-700">
						<input 
							type="checkbox" 
							bind:checked={metadata.draft}
							class="rounded border-secondary-300 text-primary focus:ring-primary"
						>
						Draft
					</label>
				</div>
			</div>
		</div>
		
		<!-- Editor Section -->
		<div class="editor-section">
			<EditorComponent 
				bind:content={editorContent}
				on:change={handleContentChange}
			/>
		</div>
		
		<!-- Preview Section -->
		{#if showPreview}
			<div class="preview-section mt-6 animate-slide-up">
				<MarkdownPreview post={blogPost} />
			</div>
		{/if}
	</div>
</div>

<!-- Upload Progress -->
<UploadProgress 
	progress={uploadProgress}
	fileName={metadata.title || 'Blog Post'}
	show={showUploadProgress}
/>

<!-- Publish Dialog -->
<PublishDialog 
	bind:show={showPublishDialog}
	post={blogPost}
	isScheduled={isScheduledPublish}
	bind:scheduledDate
	on:confirm={handlePublishConfirm}
	on:close={() => showPublishDialog = false}
/>

<style>
	.editor-page {
		min-height: 100vh;
		background: var(--color-surface);
	}
	
	.editor-content {
		min-height: calc(100vh - 200px);
	}
</style>