<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import EditorComponent from '$lib/components/Editor.svelte';
	import { draftStore } from '$lib/stores/drafts';
	import { logger } from '$lib/logger';
	
	let editorContent = '';
	let draftId: string;
	let autoSaveInterval: NodeJS.Timeout;
	let draftTitle = 'Loading...';
	
	$: draftId = $page.params.id;
	
	onMount(() => {
		// Load draft content
		const draft = draftStore.getDraft(draftId);
		if (draft) {
			editorContent = draft.content;
			draftTitle = draft.title;
			logger.info('Loaded draft:', draftId);
		} else {
			logger.error('Draft not found:', draftId);
			goto('/editor/drafts');
			return;
		}
		
		// Start auto-save
		if (browser) {
			autoSaveInterval = setInterval(() => {
				if (editorContent.trim()) {
					draftStore.saveDraft(draftId, editorContent);
					logger.debug('Auto-saved draft');
				}
			}, 30000); // Save every 30 seconds
		}
	});
	
	onDestroy(() => {
		if (autoSaveInterval) {
			clearInterval(autoSaveInterval);
		}
	});
	
	function handleContentChange(event: CustomEvent<string>) {
		editorContent = event.detail;
		// Update title based on content
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = editorContent;
		const textContent = tempDiv.textContent || '';
		draftTitle = textContent.split('\n')[0].substring(0, 50) || 'Untitled Draft';
	}
	
	function handleSave() {
		if (draftId && editorContent.trim()) {
			draftStore.saveDraft(draftId, editorContent);
			logger.info('Draft saved manually');
		}
	}
	
	function handleDelete() {
		if (confirm('Are you sure you want to delete this draft?')) {
			draftStore.deleteDraft(draftId);
			goto('/editor/drafts');
		}
	}
</script>

<div class="editor-page">
	<div class="editor-header">
		<h1>{draftTitle}</h1>
		<div class="actions">
			<button on:click={handleSave} class="save-button">
				Save Draft
			</button>
			<button on:click={handleDelete} class="delete-button">
				Delete
			</button>
			<a href="/editor/drafts" class="drafts-link">
				Back to Drafts
			</a>
		</div>
	</div>
	
	{#if editorContent}
		<EditorComponent 
			bind:content={editorContent}
			on:change={handleContentChange}
		/>
	{/if}
</div>

<style>
	.editor-page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background: #f8f9fa;
		border-bottom: 1px solid #dee2e6;
	}
	
	.editor-header h1 {
		margin: 0;
		font-size: 1.5rem;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 50%;
	}
	
	.actions {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
	
	.save-button {
		padding: 0.5rem 1rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background 0.2s;
	}
	
	.save-button:hover {
		background: #218838;
	}
	
	.delete-button {
		padding: 0.5rem 1rem;
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: background 0.2s;
	}
	
	.delete-button:hover {
		background: #c82333;
	}
	
	.drafts-link {
		color: #007bff;
		text-decoration: none;
		font-size: 0.875rem;
	}
	
	.drafts-link:hover {
		text-decoration: underline;
	}
	
	@media (max-width: 768px) {
		.editor-header {
			padding: 1rem;
			flex-wrap: wrap;
			gap: 0.5rem;
		}
		
		.editor-header h1 {
			max-width: 100%;
			font-size: 1.25rem;
			flex: 1 0 100%;
		}
		
		.actions {
			width: 100%;
			justify-content: space-between;
		}
	}
</style>