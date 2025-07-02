<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { BlogPost, PostStatus } from '$lib/types/blog';
	import { S3ClientService } from '$lib/services/s3-client';
	
	let posts: BlogPost[] = [];
	let filteredPosts: BlogPost[] = [];
	let loading = true;
	let error: string | null = null;
	let searchQuery = '';
	let statusFilter: PostStatus | 'all' = 'all';
	let sortBy: 'date' | 'title' | 'status' = 'date';
	let sortOrder: 'asc' | 'desc' = 'desc';
	let selectedPosts = new Set<string>();
	let showBulkActions = false;
	
	const s3Service = new S3ClientService();
	
	// Status colors
	const statusColors = {
		draft: 'bg-secondary-100 text-secondary-800',
		scheduled: 'bg-warning-100 text-warning-800',
		published: 'bg-success-100 text-success-800',
		archived: 'bg-error-100 text-error-800'
	};
	
	onMount(() => {
		loadPosts();
	});
	
	$: {
		filterAndSortPosts();
	}
	
	$: showBulkActions = selectedPosts.size > 0;
	
	async function loadPosts() {
		try {
			loading = true;
			error = null;
			
			// This would normally come from an API endpoint that lists and parses markdown files
			// For now, we'll simulate with some mock data
			const mockPosts: BlogPost[] = [
				{
					title: "Getting Started with SvelteKit",
					slug: "getting-started-sveltekit",
					author: "John Doe",
					publishDate: new Date('2024-01-15'),
					tags: ["svelte", "sveltekit", "tutorial"],
					excerpt: "Learn how to build modern web applications with SvelteKit",
					content: "SvelteKit is a framework for building web applications...",
					status: 'published',
					viewCount: 1250,
					lastModified: new Date('2024-01-15'),
					featured: true
				},
				{
					title: "Advanced TypeScript Patterns",
					slug: "advanced-typescript-patterns",
					author: "Jane Smith",
					publishDate: new Date('2024-01-20'),
					tags: ["typescript", "patterns", "advanced"],
					excerpt: "Explore advanced TypeScript patterns for better code",
					content: "TypeScript offers many advanced patterns...",
					status: 'scheduled',
					scheduledDate: new Date('2024-02-01'),
					viewCount: 0,
					lastModified: new Date('2024-01-20')
				},
				{
					title: "Building with Tailwind CSS",
					slug: "building-with-tailwind-css",
					author: "Bob Wilson",
					publishDate: new Date('2024-01-10'),
					tags: ["css", "tailwind", "design"],
					excerpt: "Master utility-first CSS with Tailwind",
					content: "Tailwind CSS is a utility-first framework...",
					status: 'draft',
					viewCount: 0,
					lastModified: new Date('2024-01-22')
				}
			];
			
			posts = mockPosts;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load posts';
		} finally {
			loading = false;
		}
	}
	
	function filterAndSortPosts() {
		let filtered = posts;
		
		// Apply search filter
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(post => 
				post.title.toLowerCase().includes(query) ||
				post.excerpt.toLowerCase().includes(query) ||
				post.tags.some(tag => tag.toLowerCase().includes(query)) ||
				post.author.toLowerCase().includes(query)
			);
		}
		
		// Apply status filter
		if (statusFilter !== 'all') {
			filtered = filtered.filter(post => post.status === statusFilter);
		}
		
		// Apply sorting
		filtered.sort((a, b) => {
			let aVal, bVal;
			
			switch (sortBy) {
				case 'title':
					aVal = a.title.toLowerCase();
					bVal = b.title.toLowerCase();
					break;
				case 'status':
					aVal = a.status || 'draft';
					bVal = b.status || 'draft';
					break;
				case 'date':
				default:
					aVal = new Date(a.lastModified || a.publishDate).getTime();
					bVal = new Date(b.lastModified || b.publishDate).getTime();
					break;
			}
			
			const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortOrder === 'asc' ? comparison : -comparison;
		});
		
		filteredPosts = filtered;
	}
	
	function togglePostSelection(slug: string) {
		if (selectedPosts.has(slug)) {
			selectedPosts.delete(slug);
		} else {
			selectedPosts.add(slug);
		}
		selectedPosts = selectedPosts; // Trigger reactivity
	}
	
	function selectAllPosts() {
		if (selectedPosts.size === filteredPosts.length) {
			selectedPosts.clear();
		} else {
			filteredPosts.forEach(post => selectedPosts.add(post.slug));
		}
		selectedPosts = selectedPosts; // Trigger reactivity
	}
	
	async function bulkDelete() {
		if (confirm(`Delete ${selectedPosts.size} selected posts? This action cannot be undone.`)) {
			try {
				// In a real app, this would call an API to delete posts
				posts = posts.filter(post => !selectedPosts.has(post.slug));
				selectedPosts.clear();
				selectedPosts = selectedPosts;
				showNotification('Posts deleted successfully', 'success');
			} catch (err) {
				showNotification('Failed to delete posts', 'error');
			}
		}
	}
	
	async function bulkArchive() {
		try {
			// In a real app, this would call an API to update post status
			posts = posts.map(post => 
				selectedPosts.has(post.slug) 
					? { ...post, status: 'archived' as PostStatus }
					: post
			);
			selectedPosts.clear();
			selectedPosts = selectedPosts;
			showNotification('Posts archived successfully', 'success');
		} catch (err) {
			showNotification('Failed to archive posts', 'error');
		}
	}
	
	async function bulkChangeStatus(newStatus: PostStatus) {
		try {
			// In a real app, this would call an API to update post status
			posts = posts.map(post => 
				selectedPosts.has(post.slug) 
					? { ...post, status: newStatus }
					: post
			);
			selectedPosts.clear();
			selectedPosts = selectedPosts;
			showNotification(`Posts marked as ${newStatus}`, 'success');
		} catch (err) {
			showNotification('Failed to update posts', 'error');
		}
	}
	
	function editPost(slug: string) {
		goto(`/editor/${slug}`);
	}
	
	function createNewPost() {
		goto('/editor/new');
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
	
	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	
	function getStatusIcon(status: PostStatus) {
		switch (status) {
			case 'published':
				return '✓';
			case 'scheduled':
				return '⏰';
			case 'draft':
				return '✏️';
			case 'archived':
				return '📁';
			default:
				return '❓';
		}
	}
</script>

<svelte:head>
	<title>Content Dashboard</title>
</svelte:head>

<div class="dashboard-page">
	<div class="dashboard-header bg-surface-container-low border-b border-secondary-200 px-6 py-4">
		<div class="max-w-7xl mx-auto flex justify-between items-center">
			<div>
				<h1 class="text-headline-medium font-medium text-secondary-900">Content Dashboard</h1>
				<p class="text-body-medium text-secondary-600 mt-1">
					Manage and organize your blog posts
				</p>
			</div>
			<button on:click={createNewPost} class="btn-primary">
				<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				New Post
			</button>
		</div>
	</div>
	
	<div class="dashboard-content max-w-7xl mx-auto px-6 py-6">
		<!-- Filters and Search -->
		<div class="filters-section bg-white rounded-xl border border-secondary-200 p-6 mb-6">
			<div class="flex flex-col lg:flex-row gap-4">
				<!-- Search -->
				<div class="flex-1">
					<label for="search" class="sr-only">Search posts</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg class="h-5 w-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							id="search"
							type="text"
							bind:value={searchQuery}
							placeholder="Search posts..."
							class="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
						/>
					</div>
				</div>
				
				<!-- Status Filter -->
				<div class="lg:w-48">
					<label for="status-filter" class="sr-only">Filter by status</label>
					<select
						id="status-filter"
						bind:value={statusFilter}
						class="block w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
					>
						<option value="all">All Status</option>
						<option value="draft">Drafts</option>
						<option value="scheduled">Scheduled</option>
						<option value="published">Published</option>
						<option value="archived">Archived</option>
					</select>
				</div>
				
				<!-- Sort -->
				<div class="lg:w-48">
					<label for="sort-by" class="sr-only">Sort by</label>
					<select
						id="sort-by"
						bind:value={sortBy}
						class="block w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
					>
						<option value="date">Last Modified</option>
						<option value="title">Title</option>
						<option value="status">Status</option>
					</select>
				</div>
				
				<!-- Sort Order -->
				<button
					on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
					class="lg:w-auto px-3 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors"
					title={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if sortOrder === 'asc'}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
						{/if}
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Bulk Actions -->
		{#if showBulkActions}
			<div class="bulk-actions bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6">
				<div class="flex items-center justify-between">
					<div class="text-primary-800">
						{selectedPosts.size} post{selectedPosts.size === 1 ? '' : 's'} selected
					</div>
					<div class="flex items-center gap-3">
						<button
							on:click={() => bulkChangeStatus('published')}
							class="btn-secondary btn-sm"
						>
							Publish
						</button>
						<button
							on:click={() => bulkChangeStatus('draft')}
							class="btn-secondary btn-sm"
						>
							Draft
						</button>
						<button
							on:click={bulkArchive}
							class="btn-secondary btn-sm"
						>
							Archive
						</button>
						<button
							on:click={bulkDelete}
							class="btn-danger btn-sm"
						>
							Delete
						</button>
					</div>
				</div>
			</div>
		{/if}
		
		<!-- Posts Table -->
		{#if loading}
			<div class="text-center py-12">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
				<p class="mt-4 text-secondary-600">Loading posts...</p>
			</div>
		{:else if error}
			<div class="text-center py-12">
				<div class="text-error-600 mb-4">
					<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<h3 class="text-headline-small text-error-800 mb-2">Error Loading Posts</h3>
				<p class="text-body-medium text-error-600 mb-4">{error}</p>
				<button on:click={loadPosts} class="btn-primary">Try Again</button>
			</div>
		{:else if filteredPosts.length === 0}
			<div class="text-center py-12">
				<div class="text-secondary-400 mb-4">
					<svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<h3 class="text-headline-small text-secondary-800 mb-2">No Posts Found</h3>
				<p class="text-body-medium text-secondary-600 mb-4">
					{posts.length === 0 ? 'Start creating your first blog post!' : 'Try adjusting your search or filters.'}
				</p>
				{#if posts.length === 0}
					<button on:click={createNewPost} class="btn-primary">Create First Post</button>
				{/if}
			</div>
		{:else}
			<div class="posts-table bg-white rounded-xl border border-secondary-200 overflow-hidden">
				<table class="w-full">
					<thead class="bg-secondary-50 border-b border-secondary-200">
						<tr>
							<th class="px-6 py-3 text-left">
								<input
									type="checkbox"
									checked={selectedPosts.size === filteredPosts.length && filteredPosts.length > 0}
									on:change={selectAllPosts}
									class="rounded border-secondary-300 text-primary focus:ring-primary"
								/>
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
								Title
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
								Status
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
								Author
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
								Views
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
								Last Modified
							</th>
							<th class="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-secondary-200">
						{#each filteredPosts as post (post.slug)}
							<tr class="hover:bg-secondary-50 transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									<input
										type="checkbox"
										checked={selectedPosts.has(post.slug)}
										on:change={() => togglePostSelection(post.slug)}
										class="rounded border-secondary-300 text-primary focus:ring-primary"
									/>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-start">
										<div class="flex-1 min-w-0">
											<button
												on:click={() => editPost(post.slug)}
												class="text-left w-full group"
											>
												<div class="text-sm font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">
													{post.title}
													{#if post.featured}
														<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-warning-100 text-warning-800">
															Featured
														</span>
													{/if}
												</div>
												<div class="text-sm text-secondary-500 mt-1 line-clamp-2">
													{post.excerpt}
												</div>
												<div class="flex items-center mt-2 space-x-2">
													{#each post.tags as tag}
														<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800">
															{tag}
														</span>
													{/each}
												</div>
											</button>
										</div>
									</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusColors[post.status || 'draft']}">
										<span class="mr-1">{getStatusIcon(post.status || 'draft')}</span>
										{(post.status || 'draft').charAt(0).toUpperCase() + (post.status || 'draft').slice(1)}
									</span>
									{#if post.status === 'scheduled' && post.scheduledDate}
										<div class="text-xs text-secondary-500 mt-1">
											{formatDate(post.scheduledDate)}
										</div>
									{/if}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
									{post.author}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
									{post.viewCount?.toLocaleString() || 0}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
									{formatDate(post.lastModified || post.publishDate)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
									<div class="flex items-center justify-end space-x-2">
										<button
											on:click={() => editPost(post.slug)}
											class="text-primary-600 hover:text-primary-900 transition-colors"
											title="Edit post"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
										</button>
										<button
											on:click={() => {/* View post */}}
											class="text-secondary-600 hover:text-secondary-900 transition-colors"
											title="View post"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</div>

<style>
	.dashboard-page {
		min-height: 100vh;
		background: var(--color-surface);
	}
	
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	
	.btn-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
	}
	
	.btn-danger {
		background-color: var(--color-error-600);
		color: white;
		border: 1px solid var(--color-error-600);
		border-radius: 0.5rem;
		padding: 0.5rem 1rem;
		font-weight: 500;
		transition: all 0.2s;
		cursor: pointer;
	}
	
	.btn-danger:hover {
		background-color: var(--color-error-700);
		border-color: var(--color-error-700);
	}
</style>