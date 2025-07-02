<script lang="ts">
	import { draftStore, type Draft } from '$lib/stores/drafts';
	import { goto } from '$app/navigation';
	import { logger } from '$lib/logger';
	
	let drafts: Draft[] = [];
	
	draftStore.subscribe(value => {
		drafts = value.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
	});
	
	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
	
	function openDraft(draft: Draft) {
		goto(`/editor/${draft.id}`);
	}
	
	function deleteDraft(event: Event, id: string) {
		event.stopPropagation();
		if (confirm('Are you sure you want to delete this draft?')) {
			draftStore.deleteDraft(id);
			logger.info('Draft deleted:', id);
		}
	}
	
	function createNewDraft() {
		goto('/editor/new');
	}
</script>

<div class="drafts-page">
	<div class="drafts-header">
		<h1>My Drafts</h1>
		<button on:click={createNewDraft} class="new-draft-button">
			+ New Draft
		</button>
	</div>
	
	{#if drafts.length === 0}
		<div class="empty-state">
			<p>No drafts yet. Start writing!</p>
			<button on:click={createNewDraft} class="create-button">
				Create Your First Draft
			</button>
		</div>
	{:else}
		<div class="drafts-grid">
			{#each drafts as draft}
				<div 
					class="draft-card"
					on:click={() => openDraft(draft)}
					on:keydown={(e) => e.key === 'Enter' && openDraft(draft)}
					role="button"
					tabindex="0"
				>
					<h3>{draft.title}</h3>
					<div class="draft-meta">
						<span>{draft.wordCount} words</span>
						<span>•</span>
						<span>Updated {formatDate(draft.updatedAt)}</span>
					</div>
					<button 
						class="delete-button"
						on:click={(e) => deleteDraft(e, draft.id)}
						title="Delete draft"
					>
						🗑️
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.drafts-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	.drafts-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}
	
	.drafts-header h1 {
		margin: 0;
		color: #333;
	}
	
	.new-draft-button {
		padding: 0.75rem 1.5rem;
		background: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.2s;
	}
	
	.new-draft-button:hover {
		background: #0056b3;
	}
	
	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}
	
	.empty-state p {
		font-size: 1.25rem;
		color: #6c757d;
		margin-bottom: 2rem;
	}
	
	.create-button {
		padding: 1rem 2rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1.125rem;
		transition: background 0.2s;
	}
	
	.create-button:hover {
		background: #218838;
	}
	
	.drafts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}
	
	.draft-card {
		position: relative;
		padding: 1.5rem;
		background: white;
		border: 1px solid #dee2e6;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}
	
	.draft-card:hover {
		border-color: #007bff;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}
	
	.draft-card:focus {
		outline: 2px solid #007bff;
		outline-offset: 2px;
	}
	
	.draft-card h3 {
		margin: 0 0 0.75rem;
		font-size: 1.125rem;
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding-right: 2rem;
	}
	
	.draft-meta {
		display: flex;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #6c757d;
	}
	
	.delete-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.25rem;
		opacity: 0.6;
		transition: opacity 0.2s;
		padding: 0.25rem;
	}
	
	.delete-button:hover {
		opacity: 1;
	}
	
	@media (max-width: 768px) {
		.drafts-page {
			padding: 1rem;
		}
		
		.drafts-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}
		
		.new-draft-button {
			width: 100%;
		}
		
		.drafts-grid {
			grid-template-columns: 1fr;
		}
	}
</style>