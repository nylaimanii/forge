<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { showToast } from '$lib/stores/toasts';

	let canvasContainer: HTMLDivElement | undefined = $state();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let reactRoot: any = null;

	onMount(async () => {
		if (!canvasContainer) return;

		try {
			const [ReactDOM, React, tldrawModule] = await Promise.all([
				import('react-dom/client'),
				import('react'),
				import('tldraw'),
			]);

			const { Tldraw } = tldrawModule;
			const { createElement: h } = React;

			reactRoot = ReactDOM.createRoot(canvasContainer);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			let toastShown = false;
			reactRoot.render(
				h(Tldraw, {
					onMount: (tlEditor: any) => {
						tlEditor.store.listen(() => {
							if (!toastShown) {
								toastShown = true;
								showToast('sign up to save your whiteboard', 'info');
								setTimeout(() => { toastShown = false; }, 5000);
							}
						}, { scope: 'document', source: 'user' });
					},
				})
			);
		} catch (err) {
			console.error('tldraw failed to load', err);
		}
	});

	onDestroy(() => {
		reactRoot?.unmount();
	});
</script>

<div
	bind:this={canvasContainer}
	class="-mt-12"
	style="height: calc(100vh - 6rem);"
></div>
