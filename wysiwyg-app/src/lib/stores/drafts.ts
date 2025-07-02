import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { logger } from '$lib/logger';

export interface Draft {
	id: string;
	title: string;
	content: string;
	createdAt: Date;
	updatedAt: Date;
	wordCount: number;
}

const DRAFTS_STORAGE_KEY = 'see_drafts';

function createDraftStore() {
	const { subscribe, set, update } = writable<Draft[]>([]);

	// Load drafts from localStorage on initialization
	if (browser) {
		const storedDrafts = localStorage.getItem(DRAFTS_STORAGE_KEY);
		if (storedDrafts) {
			try {
				const drafts = JSON.parse(storedDrafts).map((draft: any) => ({
					...draft,
					createdAt: new Date(draft.createdAt),
					updatedAt: new Date(draft.updatedAt)
				}));
				set(drafts);
			} catch (error) {
				logger.error('Failed to load drafts from localStorage:', error);
			}
		}
	}

	function saveDraft(id: string, content: string) {
		update(drafts => {
			const existingIndex = drafts.findIndex(d => d.id === id);
			const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
			
			// Extract title from content (first line or first 50 chars)
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = content;
			const textContent = tempDiv.textContent || '';
			const title = textContent.split('\n')[0].substring(0, 50) || 'Untitled Draft';
			
			const draft: Draft = {
				id,
				title,
				content,
				wordCount,
				createdAt: existingIndex >= 0 ? drafts[existingIndex].createdAt : new Date(),
				updatedAt: new Date()
			};

			if (existingIndex >= 0) {
				drafts[existingIndex] = draft;
			} else {
				drafts.push(draft);
			}

			// Save to localStorage
			if (browser) {
				localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
			}

			return drafts;
		});
	}

	function deleteDraft(id: string) {
		update(drafts => {
			const filtered = drafts.filter(d => d.id !== id);
			
			// Update localStorage
			if (browser) {
				localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
			}

			logger.info('Draft deleted:', id);
			return filtered;
		});
	}

	function getDraft(id: string): Draft | undefined {
		let draft: Draft | undefined;
		subscribe(drafts => {
			draft = drafts.find(d => d.id === id);
		})();
		return draft;
	}

	function clearAllDrafts() {
		set([]);
		if (browser) {
			localStorage.removeItem(DRAFTS_STORAGE_KEY);
		}
		logger.info('All drafts cleared');
	}

	return {
		subscribe,
		saveDraft,
		deleteDraft,
		getDraft,
		clearAllDrafts
	};
}

export const draftStore = createDraftStore();