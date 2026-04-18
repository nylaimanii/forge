<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { LayoutData } from './$types';
	import Sidebar from '$components/layout/Sidebar.svelte';
	import TopBar from '$components/layout/TopBar.svelte';
	import CommandPalette from '$components/layout/CommandPalette.svelte';
	import Toast from '$components/ui/Toast.svelte';
	import { user, breadcrumbs } from '$lib/stores';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	let paletteOpen = $state(false);

	// homepage (/) is a public marketing page — render without the app shell
	let isHomePage = $derived(page.url.pathname === '/');

	onMount(() => {
		if (data.session?.user) {
			user.set(data.session.user);
		}
	});

	function handleKey(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			paletteOpen = !paletteOpen;
		}
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if isHomePage}
	{@render children()}
{:else}
	<Sidebar />

	<!-- breadcrumbs are fed from nested layouts via the store -->
	<TopBar breadcrumbs={$breadcrumbs} onCommandPalette={() => (paletteOpen = true)} />

	<main class="ml-16 mt-14 min-h-[calc(100vh-3.5rem)] overflow-auto bg-[var(--color-bg)]">
		{#key data}
			<div class="h-full" in:fade={{ duration: 150, delay: 50 }} out:fade={{ duration: 100 }}>
				{@render children()}
			</div>
		{/key}
	</main>

	<CommandPalette bind:open={paletteOpen} onclose={() => (paletteOpen = false)} />
	<Toast />
{/if}
