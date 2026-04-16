<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import Badge from '$components/ui/Badge.svelte';
	import { relativeTime } from '$lib/utils';

	interface Props {
		id:           string;
		name:         string;
		color?:       string;  // hex color for the left accent border
		tableCount?:  number;  // placeholder — real count comes in a later step
		updatedAt:    string;  // ISO timestamp
		index?:       number;  // used for staggered entrance delay by parent
	}

	let {
		id,
		name,
		color      = '#6c63ff',
		tableCount = 0,
		updatedAt,
		index      = 0,
	}: Props = $props();

	function navigate() {
		goto(`/project/${id}/schema`);
	}

	// keyboard support: enter/space activates the card
	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			navigate();
		}
	}

	let relative = $derived(relativeTime(updatedAt));
</script>

<!-- staggered entrance via fly transition; delay driven by index prop -->
<div
	in:fly={{ y: 12, duration: 250, delay: index * 40 }}
>
	<button
		onclick={navigate}
		onkeydown={handleKey}
		class="
			group w-full text-left
			relative rounded-xl overflow-hidden
			bg-[var(--color-surface-1)] border border-[var(--color-border)]
			backdrop-blur-md
			transition-all duration-200 ease-out
			hover:-translate-y-0.5
			hover:border-[var(--color-accent)]/30
			hover:shadow-[0_8px_32px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]
			focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
			cursor-pointer
		"
		style="border-left: 4px solid {color};"
		aria-label="Open project {name}"
	>
		<div class="px-5 py-4 flex flex-col gap-3">

			<!-- project name -->
			<h3
				class="text-base font-semibold text-[var(--color-text)] font-[var(--font-display)] leading-tight truncate group-hover:text-white transition-colors"
			>
				{name}
			</h3>

			<!-- table count badge -->
			<div>
				<Badge color="muted">
					{#snippet children()}
						{tableCount} {tableCount === 1 ? 'table' : 'tables'}
					{/snippet}
				</Badge>
			</div>

			<!-- last edited -->
			<p class="text-xs text-[var(--color-muted)] font-[var(--font-body)]">
				edited {relative}
			</p>
		</div>
	</button>
</div>
