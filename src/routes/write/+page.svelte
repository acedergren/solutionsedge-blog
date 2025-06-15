<script lang="ts">
	let title = '';
	let content = '';
	let tags = '';
	let isPreview = false;
</script>

<svelte:head>
	<title>Write - The Solutions Edge</title>
	<meta name="description" content="Write and share your technical insights with The Solutions Edge community." />
</svelte:head>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<!-- Header -->
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-3xl font-bold">Write a story</h1>
		<div class="flex items-center gap-4">
			<button 
				class="btn-ghost"
				on:click={() => isPreview = !isPreview}
			>
				<span class="material-icons-outlined text-[20px] mr-2">
					{isPreview ? 'edit' : 'preview'}
				</span>
				{isPreview ? 'Edit' : 'Preview'}
			</button>
			<button class="btn-secondary">
				Save draft
			</button>
			<button class="btn-primary" disabled={!title || !content}>
				Publish
			</button>
		</div>
	</div>

	{#if !isPreview}
		<!-- Editor -->
		<div class="space-y-6">
			<!-- Title -->
			<input
				type="text"
				bind:value={title}
				placeholder="Add a title..."
				class="w-full text-4xl font-bold bg-transparent border-none outline-none placeholder:text-md-on-surface-variant/50"
			/>

			<!-- Content -->
			<textarea
				bind:value={content}
				placeholder="Tell your story..."
				class="w-full min-h-[400px] text-lg bg-transparent border-none outline-none resize-none placeholder:text-md-on-surface-variant/50 font-serif"
			/>

			<!-- Tags -->
			<div class="border-t border-md-outline dark:border-md-dark-outline pt-6">
				<label for="tags" class="block text-sm font-medium mb-2">
					Add tags (comma-separated)
				</label>
				<input
					id="tags"
					type="text"
					bind:value={tags}
					placeholder="e.g., cloud computing, kubernetes, edge"
					class="w-full px-4 py-2 bg-md-surface-variant dark:bg-md-dark-surface-variant rounded-lg border border-md-outline dark:border-md-dark-outline focus:outline-none focus:ring-2 focus:ring-md-primary"
				/>
			</div>

			<!-- Tips -->
			<div class="bg-md-surface-variant dark:bg-md-dark-surface-variant p-6 rounded-lg">
				<h3 class="font-bold mb-3 flex items-center gap-2">
					<span class="material-icons-outlined text-[20px]">tips_and_updates</span>
					Writing Tips
				</h3>
				<ul class="space-y-2 text-sm text-md-on-surface-variant">
					<li>• Use Markdown for formatting (e.g., **bold**, *italic*, # headers)</li>
					<li>• Include code blocks with triple backticks (```)</li>
					<li>• Add images by dragging and dropping or using ![alt text](url)</li>
					<li>• Keep paragraphs short for better readability</li>
					<li>• Use subheadings to organize your content</li>
				</ul>
			</div>
		</div>
	{:else}
		<!-- Preview -->
		<article class="article-body">
			<h1 class="article-title mb-4">{title || 'Untitled'}</h1>
			<div class="flex items-center gap-4 mb-8">
				<img 
					src="https://ui-avatars.com/api/?name=You&background=1a8917&color=fff" 
					alt="Your avatar"
					class="w-12 h-12 rounded-full"
				/>
				<div>
					<p class="font-medium">You</p>
					<p class="text-sm text-md-on-surface-variant">
						{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · 
						{Math.ceil((content.split(' ').length) / 200)} min read
					</p>
				</div>
			</div>
			<div class="whitespace-pre-wrap">
				{content || 'Your story will appear here...'}
			</div>
			{#if tags}
				<div class="flex flex-wrap gap-2 mt-8">
					{#each tags.split(',').map(t => t.trim()).filter(Boolean) as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}
		</article>
	{/if}
</div>

<style>
	textarea {
		line-height: 1.8;
	}
</style>