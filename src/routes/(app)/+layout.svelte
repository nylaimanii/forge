<script lang="ts">
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import TopBar from '$components/layout/TopBar.svelte';
	import CommandPalette from '$components/layout/CommandPalette.svelte';
	import KeyboardShortcutsModal from '$components/ui/KeyboardShortcutsModal.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import { user, breadcrumbs } from '$lib/stores';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	let paletteOpen   = $state(false);
	let shortcutsOpen = $state(false);

	onMount(() => {
		if (data.session?.user) {
			user.set(data.session.user);
		}
		// command palette dispatches this event when "Keyboard Shortcuts" is selected
		window.addEventListener('forge:shortcuts', () => { shortcutsOpen = true; });
	});

	function handleKey(e: KeyboardEvent) {
		// ignore when typing in an input/textarea
		const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
		const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';

		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			paletteOpen = !paletteOpen;
			return;
		}

		// ? key opens shortcuts modal (only when not in an input)
		if (e.key === '?' && !isInput) {
			e.preventDefault();
			shortcutsOpen = true;
		}
	}
</script>

<svelte:window onkeydown={handleKey} />

<Sidebar />

<!-- breadcrumbs are fed from nested layouts via the store -->
<TopBar breadcrumbs={$breadcrumbs} onCommandPalette={() => (paletteOpen = true)} />

<!--
	NOTE: do NOT wrap {@render children()} in {#key data} or an opacity
	transition. data invalidates after every form action (?/saveWhiteboard,
	?/saveQuery, etc.), so {#key data} would tear down monaco / tldraw on
	every autosave, and an opacity transition creates a compositing layer
	that swallows canvas paint calls.
-->
<main class="ml-16 mt-14 min-h-[calc(100vh-3.5rem)] overflow-auto bg-[var(--color-bg)]">
	<div class="h-full">
		{@render children()}
	</div>
</main>

<CommandPalette bind:open={paletteOpen} onclose={() => (paletteOpen = false)} />
<KeyboardShortcutsModal open={shortcutsOpen} onclose={() => (shortcutsOpen = false)} />
<Toast />
