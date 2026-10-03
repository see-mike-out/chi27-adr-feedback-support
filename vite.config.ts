import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: false,
				strict: true
			}),
			paths: {
				// Repo name, so assets resolve under the project page path.
				// Served at https://<user>.github.io/chi27-adr-feedback-support/
				base: command === 'serve' ? '' : '/chi27-adr-feedback-support'
			},
			appDir: 'internal'
		})
	]
}));
