import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 5173,
		strictPort: false,
		hmr: {
			overlay: false
		}
	},
	preview: {
		port: 4173,
		strictPort: false
	},
	optimizeDeps: {
		exclude: ['@auth/sveltekit'],
		include: ['quill']
	},
	ssr: {
		noExternal: ['quill', 'dompurify', 'turndown']
	}
});
