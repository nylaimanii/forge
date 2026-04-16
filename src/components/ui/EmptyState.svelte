<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		icon?:        Snippet;
		title:        string;
		description?: string;
		cta?:         Snippet;
	}

	let { icon, title, description, cta }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
	{#if icon}
		<div class="text-[var(--color-muted)] opacity-50 w-12 h-12">
			{@render icon()}
		</div>
	{/if}

	<div class="flex flex-col gap-2">
		<h3 class="text-base font-semibold text-[var(--color-text)] font-[var(--font-display)]">{title}</h3>
		{#if description}
			<p class="text-sm text-[var(--color-muted)] max-w-sm font-[var(--font-ui)]">{description}</p>
		{/if}
	</div>

	{#if cta}
		<div class="mt-2">
			{@render cta()}
		</div>
	{/if}
</div>
