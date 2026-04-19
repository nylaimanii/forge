<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { isDemoMode } from '$lib/stores/demo';
	import DemoBanner from '$components/layout/DemoBanner.svelte';

	let { children } = $props();

	onMount(() => isDemoMode.set(true));
	onDestroy(() => isDemoMode.set(false));
</script>

<DemoBanner />
<div class="pt-10">
	{@render children()}
</div>
