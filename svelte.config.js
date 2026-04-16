import adapter from '@sveltejs/adapter-auto';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// force runes mode for all project files. can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true),
	},
	kit: {
		adapter: adapter(),
		alias: {
			// $lib is registered automatically by sveltekit
			// $components gives us clean imports like: import Button from '$components/ui/Button.svelte'
			$components: path.resolve(__dirname, 'src/components'),
		},
	},
};

export default config;
