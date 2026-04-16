<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	interface Props {
		label:     string;
		children?: Snippet;
		position?: 'top' | 'right' | 'bottom' | 'left';
	}

	let { label, children, position = 'top' }: Props = $props();

	let visible = $state(false);

	const posMap = {
		top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
		right:  'left-full  top-1/2  -translate-y-1/2 ml-2',
		bottom: 'top-full   left-1/2 -translate-x-1/2 mt-2',
		left:   'right-full top-1/2  -translate-y-1/2 mr-2',
	};
</script>

<!-- wrapper must be relative so the tooltip positions correctly -->
<div
	class="relative inline-flex"
	onmouseenter={() => (visible = true)}
	onmouseleave={() => (visible = false)}
>
	{#if children}{@render children()}{/if}

	{#if visible}
		<div
			class="pointer-events-none absolute z-50 {posMap[position]} whitespace-nowrap rounded-md px-2 py-1 text-xs text-[var(--color-text)] font-[var(--font-ui)] glass shadow-lg"
			transition:fade={{ duration: 100 }}
		>
			{label}
		</div>
	{/if}
</div>
