<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { BlogPost, ValidationError } from '$lib/types/blog';
	import { validatePublishReady } from '$lib/utils/validation';
	
	export let show = false;
	export let post: BlogPost;
	export let isScheduled = false;
	export let scheduledDate: Date | null = null;
	
	const dispatch = createEventDispatcher();
	
	let validationErrors: ValidationError[] = [];
	let isValidating = false;
	
	$: if (show) {
		validatePost();
	}
	
	function validatePost() {
		isValidating = true;
		validationErrors = validatePublishReady(post);
		isValidating = false;
	}
	
	function handleConfirm() {
		if (validationErrors.length === 0) {
			dispatch('confirm', { 
				scheduled: isScheduled, 
				scheduledDate: isScheduled ? scheduledDate : null 
			});
			close();
		}
	}
	
	function close() {
		show = false;
		validationErrors = [];
		dispatch('close');
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

{#if show}
	<div class="dialog-backdrop" on:click={close} on:keydown={handleKeydown}>
		<div class="dialog" on:click|stopPropagation role="dialog" aria-modal="true">
			<div class="dialog-header">
				<h2 class="text-headline-small">
					{isScheduled ? 'Schedule Post' : 'Publish Post'}
				</h2>
				<button 
					class="icon-button"
					on:click={close}
					aria-label="Close dialog"
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
			
			<div class="dialog-content">
				<!-- Pre-publish Checklist -->
				<div class="checklist-section">
					<h3 class="text-title-medium mb-4">Pre-publish Checklist</h3>
					
					<div class="checklist-items">
						<div class="checklist-item" class:error={validationErrors.some(e => e.field === 'title')}>
							<div class="checklist-icon">
								{#if !validationErrors.some(e => e.field === 'title')}
									<svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>
							<div class="checklist-content">
								<div class="checklist-label">Title</div>
								{#if post.title}
									<div class="checklist-value">{post.title}</div>
								{:else}
									<div class="checklist-error">Title is required</div>
								{/if}
							</div>
						</div>
						
						<div class="checklist-item" class:error={validationErrors.some(e => e.field === 'excerpt')}>
							<div class="checklist-icon">
								{#if !validationErrors.some(e => e.field === 'excerpt')}
									<svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>
							<div class="checklist-content">
								<div class="checklist-label">Excerpt</div>
								{#if post.excerpt}
									<div class="checklist-value text-secondary-600">{post.excerpt.substring(0, 60)}...</div>
								{:else}
									<div class="checklist-error">Excerpt is required for SEO</div>
								{/if}
							</div>
						</div>
						
						<div class="checklist-item" class:error={validationErrors.some(e => e.field === 'tags')}>
							<div class="checklist-icon">
								{#if !validationErrors.some(e => e.field === 'tags')}
									<svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>
							<div class="checklist-content">
								<div class="checklist-label">Tags</div>
								{#if post.tags && post.tags.length > 0}
									<div class="checklist-value">{post.tags.join(', ')}</div>
								{:else}
									<div class="checklist-error">At least one tag is required</div>
								{/if}
							</div>
						</div>
						
						<div class="checklist-item" class:warning={!post.coverImage}>
							<div class="checklist-icon">
								{#if post.coverImage}
									<svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-5 h-5 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>
							<div class="checklist-content">
								<div class="checklist-label">Featured Image</div>
								{#if post.coverImage}
									<div class="checklist-value">Image uploaded</div>
								{:else}
									<div class="checklist-warning">Recommended for better engagement</div>
								{/if}
							</div>
						</div>
						
						<div class="checklist-item">
							<div class="checklist-icon">
								{#if post.content && post.content.trim().length > 100}
									<svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-5 h-5 text-error-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>
							<div class="checklist-content">
								<div class="checklist-label">Content</div>
								{#if post.content && post.content.trim().length > 100}
									<div class="checklist-value">{post.content.trim().split(' ').length} words</div>
								{:else}
									<div class="checklist-error">Content is too short</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
				
				<!-- Schedule Options -->
				{#if isScheduled}
					<div class="schedule-section mt-6">
						<h3 class="text-title-medium mb-4">Schedule Publishing</h3>
						<div class="form-group">
							<label for="scheduled-date" class="form-label">Publish Date & Time</label>
							<input 
								id="scheduled-date"
								type="datetime-local" 
								bind:value={scheduledDate}
								min={new Date().toISOString().slice(0, 16)}
								class="form-input"
								required
							/>
						</div>
					</div>
				{/if}
				
				<!-- Summary -->
				<div class="summary-section mt-6 p-4 bg-secondary-50 rounded-lg">
					<div class="summary-item">
						<span class="font-medium">Status after publish:</span>
						<span class="text-primary-600">
							{isScheduled ? 'Scheduled' : 'Published'}
						</span>
					</div>
					{#if isScheduled && scheduledDate}
						<div class="summary-item mt-2">
							<span class="font-medium">Will be published on:</span>
							<span>{new Date(scheduledDate).toLocaleString()}</span>
						</div>
					{/if}
				</div>
			</div>
			
			<div class="dialog-footer">
				<button class="btn-secondary" on:click={close}>
					Cancel
				</button>
				<button 
					class="btn-primary"
					on:click={handleConfirm}
					disabled={validationErrors.length > 0 || (isScheduled && !scheduledDate)}
				>
					{isScheduled ? 'Schedule Post' : 'Publish Now'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.dialog-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: fade-in 0.2s ease-out;
	}
	
	.dialog {
		background: white;
		border-radius: 1rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		max-width: 600px;
		width: 90%;
		max-height: 90vh;
		display: flex;
		flex-direction: column;
		animation: slide-up 0.3s ease-out;
	}
	
	.dialog-header {
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-secondary-200);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.dialog-content {
		padding: 1.5rem;
		overflow-y: auto;
		flex: 1;
	}
	
	.dialog-footer {
		padding: 1.5rem;
		border-top: 1px solid var(--color-secondary-200);
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}
	
	.checklist-section {
		margin-bottom: 1.5rem;
	}
	
	.checklist-items {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	
	.checklist-item {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-secondary-200);
		transition: all 0.2s;
	}
	
	.checklist-item.error {
		border-color: var(--color-error-300);
		background: var(--color-error-50);
	}
	
	.checklist-item.warning {
		border-color: var(--color-warning-300);
		background: var(--color-warning-50);
	}
	
	.checklist-icon {
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.checklist-content {
		flex: 1;
	}
	
	.checklist-label {
		font-weight: 500;
		color: var(--color-secondary-900);
		margin-bottom: 0.25rem;
	}
	
	.checklist-value {
		font-size: 0.875rem;
		color: var(--color-secondary-700);
	}
	
	.checklist-error {
		font-size: 0.875rem;
		color: var(--color-error-700);
	}
	
	.checklist-warning {
		font-size: 0.875rem;
		color: var(--color-warning-700);
	}
	
	.schedule-section {
		padding-top: 1.5rem;
		border-top: 1px solid var(--color-secondary-200);
	}
	
	.form-group {
		margin-bottom: 1rem;
	}
	
	.form-label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: var(--color-secondary-900);
	}
	
	.form-input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--color-secondary-300);
		border-radius: 0.5rem;
		font-size: 1rem;
		transition: border-color 0.2s;
	}
	
	.form-input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(var(--color-primary-500-rgb), 0.1);
	}
	
	.summary-section {
		border: 1px solid var(--color-secondary-200);
	}
	
	.summary-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.icon-button {
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		color: var(--color-secondary-600);
		transition: all 0.2s;
	}
	
	.icon-button:hover {
		background: var(--color-secondary-100);
		color: var(--color-secondary-900);
	}
	
	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	
	@keyframes slide-up {
		from {
			transform: translateY(1rem);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>