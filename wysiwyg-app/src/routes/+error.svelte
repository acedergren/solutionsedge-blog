<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="error-container">
	<h1>Error {$page.status}</h1>
	<p class="error-message">{$page.error?.message || 'An unexpected error occurred'}</p>
	
	{#if $page.error?.code}
		<p class="error-code">Error code: {$page.error.code}</p>
	{/if}
	
	<div class="actions">
		<a href="/" class="button">Go to Home</a>
		<button on:click={() => location.reload()} class="button secondary">
			Reload Page
		</button>
	</div>
</div>

<style>
	.error-container {
		max-width: 600px;
		margin: 4rem auto;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		color: #dc3545;
		margin-bottom: 1rem;
	}

	.error-message {
		font-size: 1.2rem;
		color: #666;
		margin-bottom: 1rem;
	}

	.error-code {
		font-family: monospace;
		color: #999;
		margin-bottom: 2rem;
	}

	.actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.button {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #007bff;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		border: none;
		cursor: pointer;
		font-size: 1rem;
	}

	.button:hover {
		background: #0056b3;
	}

	.button.secondary {
		background: #6c757d;
	}

	.button.secondary:hover {
		background: #545b62;
	}
</style>