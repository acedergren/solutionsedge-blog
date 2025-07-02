<script lang="ts">
	import { onMount } from 'svelte';
	import type { S3File } from '$lib/services/s3';
	import { logger } from '$lib/logger';
	
	export let files: S3File[] = [];
	export let loading = false;
	export let error: string | null = null;
	export let onFileSelect: (file: S3File) => void = () => {};
	export let onFileDelete: (file: S3File) => void = () => {};
	export let onRefresh: () => void = () => {};
	
	let selectedFile: S3File | null = null;
	let viewMode: 'grid' | 'list' = 'grid';
	let sortBy: 'name' | 'date' | 'size' = 'date';
	let sortOrder: 'asc' | 'desc' = 'desc';
	let searchQuery = '';
	
	// Filtered and sorted files
	$: filteredFiles = files.filter(file => {
		if (!searchQuery) return true;
		const filename = file.key.split('/').pop()?.toLowerCase() || '';
		return filename.includes(searchQuery.toLowerCase());
	});
	
	$: sortedFiles = [...filteredFiles].sort((a, b) => {
		let comparison = 0;
		
		switch (sortBy) {
			case 'name':
				const nameA = a.key.split('/').pop() || '';
				const nameB = b.key.split('/').pop() || '';
				comparison = nameA.localeCompare(nameB);
				break;
			case 'date':
				comparison = a.lastModified.getTime() - b.lastModified.getTime();
				break;
			case 'size':
				comparison = a.size - b.size;
				break;
		}
		
		return sortOrder === 'asc' ? comparison : -comparison;
	});
	
	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
	
	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
	
	function getFileName(key: string): string {
		return key.split('/').pop() || key;
	}
	
	function getFileType(key: string): string {
		const extension = key.split('.').pop()?.toLowerCase() || '';
		const typeMap: Record<string, string> = {
			md: 'markdown',
			jpg: 'image',
			jpeg: 'image',
			png: 'image',
			gif: 'image',
			webp: 'image',
			json: 'data',
			txt: 'text'
		};
		return typeMap[extension] || 'file';
	}
	
	function handleFileClick(file: S3File) {
		selectedFile = file;
		onFileSelect(file);
	}
	
	function handleDelete(file: S3File) {
		if (confirm(`Are you sure you want to delete ${getFileName(file.key)}?`)) {
			onFileDelete(file);
			if (selectedFile?.key === file.key) {
				selectedFile = null;
			}
		}
	}
	
	function toggleSort(field: typeof sortBy) {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'desc';
		}
	}
</script>

<div class="s3-file-browser bg-surface rounded-xl shadow-elevation-1 overflow-hidden">
	<!-- Header -->
	<div class="browser-header bg-surface-container-low border-b border-secondary-200 p-4">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-headline-small font-medium text-secondary-900">S3 Files</h3>
			<div class="flex items-center gap-2">
				<button
					on:click={onRefresh}
					class="editor-button"
					disabled={loading}
					title="Refresh"
				>
					<svg class="w-5 h-5 {loading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
					</svg>
				</button>
				<div class="view-toggle flex bg-secondary-100 rounded-lg p-1">
					<button
						on:click={() => viewMode = 'grid'}
						class="px-3 py-1 rounded {viewMode === 'grid' ? 'bg-surface shadow-sm' : ''} transition-all duration-200"
						title="Grid view"
					>
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
						</svg>
					</button>
					<button
						on:click={() => viewMode = 'list'}
						class="px-3 py-1 rounded {viewMode === 'list' ? 'bg-surface shadow-sm' : ''} transition-all duration-200"
						title="List view"
					>
						<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
						</svg>
					</button>
				</div>
			</div>
		</div>
		
		<!-- Search and filters -->
		<div class="flex items-center gap-3">
			<div class="flex-1 relative">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search files..."
					class="input w-full pl-10"
				>
				<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
			</div>
			<select bind:value={sortBy} class="input">
				<option value="name">Name</option>
				<option value="date">Date</option>
				<option value="size">Size</option>
			</select>
		</div>
	</div>
	
	<!-- Content -->
	<div class="browser-content p-4 min-h-[400px] max-h-[600px] overflow-y-auto scrollbar-thin">
		{#if loading}
			<div class="flex items-center justify-center h-full">
				<div class="text-center">
					<svg class="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
					<p class="text-body-medium text-secondary-600">Loading files...</p>
				</div>
			</div>
		{:else if error}
			<div class="bg-error-50 border border-error-200 rounded-lg p-4 text-center">
				<p class="text-body-medium text-error-700">{error}</p>
			</div>
		{:else if sortedFiles.length === 0}
			<div class="text-center py-8">
				<svg class="w-16 h-16 text-secondary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				<p class="text-body-large text-secondary-600">No files found</p>
			</div>
		{:else if viewMode === 'grid'}
			<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each sortedFiles as file}
					<div
						class="file-card card-interactive p-4 cursor-pointer {selectedFile?.key === file.key ? 'ring-2 ring-primary' : ''}"
						on:click={() => handleFileClick(file)}
						on:keydown={(e) => e.key === 'Enter' && handleFileClick(file)}
						role="button"
						tabindex="0"
					>
						<div class="flex flex-col items-center">
							<div class="file-icon mb-3">
								{#if getFileType(file.key) === 'markdown'}
									<svg class="w-12 h-12 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
									</svg>
								{:else if getFileType(file.key) === 'image'}
									<svg class="w-12 h-12 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-12 h-12 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
								{/if}
							</div>
							<h4 class="text-label-large text-secondary-800 text-center mb-1 line-clamp-2">
								{getFileName(file.key)}
							</h4>
							<p class="text-label-small text-secondary-600">
								{formatFileSize(file.size)}
							</p>
						</div>
						<div class="mt-3 pt-3 border-t border-secondary-200 flex justify-between items-center">
							<span class="text-label-small text-secondary-500">
								{formatDate(file.lastModified)}
							</span>
							<button
								on:click|stopPropagation={() => handleDelete(file)}
								class="text-error-600 hover:text-error-700 p-1"
								title="Delete"
							>
								<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
								</svg>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<table class="w-full">
				<thead>
					<tr class="border-b border-secondary-200">
						<th class="text-left pb-2">
							<button
								on:click={() => toggleSort('name')}
								class="flex items-center gap-1 text-label-large text-secondary-700 hover:text-secondary-900"
							>
								Name
								{#if sortBy === 'name'}
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										{#if sortOrder === 'desc'}
											<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
										{:else}
											<path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
										{/if}
									</svg>
								{/if}
							</button>
						</th>
						<th class="text-left pb-2">
							<button
								on:click={() => toggleSort('size')}
								class="flex items-center gap-1 text-label-large text-secondary-700 hover:text-secondary-900"
							>
								Size
								{#if sortBy === 'size'}
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										{#if sortOrder === 'desc'}
											<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
										{:else}
											<path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
										{/if}
									</svg>
								{/if}
							</button>
						</th>
						<th class="text-left pb-2">
							<button
								on:click={() => toggleSort('date')}
								class="flex items-center gap-1 text-label-large text-secondary-700 hover:text-secondary-900"
							>
								Modified
								{#if sortBy === 'date'}
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										{#if sortOrder === 'desc'}
											<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
										{:else}
											<path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" />
										{/if}
									</svg>
								{/if}
							</button>
						</th>
						<th class="w-20"></th>
					</tr>
				</thead>
				<tbody>
					{#each sortedFiles as file}
						<tr
							class="border-b border-secondary-100 hover:bg-secondary-50 cursor-pointer {selectedFile?.key === file.key ? 'bg-primary-50' : ''}"
							on:click={() => handleFileClick(file)}
						>
							<td class="py-3 flex items-center gap-3">
								{#if getFileType(file.key) === 'markdown'}
									<svg class="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
									</svg>
								{:else if getFileType(file.key) === 'image'}
									<svg class="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
									</svg>
								{:else}
									<svg class="w-5 h-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
								{/if}
								<span class="text-body-medium text-secondary-800">
									{getFileName(file.key)}
								</span>
							</td>
							<td class="py-3 text-body-small text-secondary-600">
								{formatFileSize(file.size)}
							</td>
							<td class="py-3 text-body-small text-secondary-600">
								{formatDate(file.lastModified)}
							</td>
							<td class="py-3">
								<button
									on:click|stopPropagation={() => handleDelete(file)}
									class="text-error-600 hover:text-error-700 p-1"
									title="Delete"
								>
									<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>