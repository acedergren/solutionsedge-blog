<script>
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	
	onMount(() => {
		if (browser) {
			// Import Quill CSS dynamically
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
			document.head.appendChild(link);
		}
	});
</script>

<slot />