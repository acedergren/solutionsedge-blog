<script lang="ts">
	import type { UploadProgress } from '$lib/services/s3';
	
	export let progress: UploadProgress | null = null;
	export let fileName: string = '';
	export let show: boolean = false;
	
	$: progressWidth = progress ? `${progress.percentage}%` : '0%';
	$: isComplete = progress?.percentage === 100;
</script>

{#if show && progress}
	<div class="upload-progress-container fixed bottom-4 right-4 bg-surface rounded-xl shadow-elevation-3 p-4 min-w-[300px] animate-slide-up">
		<div class="flex items-center justify-between mb-2">
			<h4 class="text-label-large font-medium text-secondary-800">
				{isComplete ? 'Upload Complete' : 'Uploading...'}
			</h4>
			{#if isComplete}
				<svg class="w-5 h-5 text-success-600 animate-spring-bounce" fill="currentColor" viewBox="0 0 20 20">
					<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
				</svg>
			{:else}
				<div class="spinner">
					<svg class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
						<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
					</svg>
				</div>
			{/if}
		</div>
		
		{#if fileName}
			<p class="text-body-small text-secondary-600 mb-2 truncate">
				{fileName}
			</p>
		{/if}
		
		<div class="progress-bar-container">
			<div class="progress-bar bg-secondary-200 rounded-full h-2 overflow-hidden">
				<div 
					class="progress-fill bg-primary h-full rounded-full transition-all duration-300 ease-out"
					style="width: {progressWidth}"
				/>
			</div>
			<div class="flex justify-between mt-1">
				<span class="text-label-small text-secondary-600">
					{Math.round(progress.loaded / 1024)} KB / {Math.round(progress.total / 1024)} KB
				</span>
				<span class="text-label-small text-secondary-600">
					{progress.percentage}%
				</span>
			</div>
		</div>
	</div>
{/if}

<style>
	.upload-progress-container {
		z-index: 1000;
	}
	
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>