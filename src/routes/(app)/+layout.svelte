<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import TopBar from '$components/layout/TopBar.svelte';
	import CommandPalette from '$components/layout/CommandPalette.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import { user } from '$lib/stores';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	let paletteOpen = $state(false);

	// hydrate the user store from the server-loaded session
	onMount(() => {
		if (data.session?.user) {
			user.set(data.session.user);
		}
	});

	// toggle command palette on cmd+k / ctrl+k
	function handleKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			paletteOpen = !paletteOpen;
		}
	}
</script>

<svelte:window onkeydown={handleKey} />

<!-- sidebar -->
<Sidebar />

<!-- topbar -->
<TopBar onCommandPalette={() => (paletteOpen = true)} />

<!-- page content — offset for fixed sidebar (w-16) + topbar (h-14) -->
<main
	class="ml-16 mt-14 min-h-[calc(100vh-3.5rem)] overflow-auto bg-[var(--color-bg)]"
>
	{#key data}
		<div
			class="h-full"
			in:fade={{ duration: 150, delay: 50 }}
			out:fade={{ duration: 100 }}
		>
			{@render children()}
		</div>
	{/key}
</main>

<!-- command palette overlay -->
<CommandPalette bind:open={paletteOpen} onclose={() => (paletteOpen = false)} />

<!-- global toast container -->
<Toast />
