import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
	],
	optimizeDeps: {
		include: ['@monaco-editor/loader'],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id: string) => {
					if (id.includes('node_modules/@monaco-editor') || id.includes('node_modules/monaco-editor')) return 'monaco';
				},
			},
		},
	},
	ssr: {
		noExternal: ['tldraw'],
	},
});
