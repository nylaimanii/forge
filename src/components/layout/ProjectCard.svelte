<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly } from 'svelte/transition';
	import { Pencil, Trash2 } from 'lucide-svelte';
	import Badge from '$components/ui/Badge.svelte';
	import { relativeTime } from '$lib/utils';

	interface Props {
		id:          string;
		name:        string;
		color?:      string;
		tableCount?: number;
		updatedAt:   string;
		index?:      number;
		onrename?:   (payload: { id: string; name: string }) => void;
		ondelete?:   (payload: { id: string; name: string }) => void;
	}

	let {
		id,
		name,
		color      = '#6c63ff',
		tableCount = 0,
		updatedAt,
		index      = 0,
		onrename,
		ondelete,
	}: Props = $props();

	let relative = $derived(relativeTime(updatedAt));

	function navigate() {
		goto(`/project/${id}/schema`);
	}

	function handleCardKey(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			navigate();
		}
	}

	function handleRename(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		onrename?.({ id, name });
	}

	function handleDelete(e: MouseEvent) {
		e.stopPropagation();
		e.preventDefault();
		ondelete?.({ id, name });
	}
</script>

<div in:fly={{ y: 12, duration: 250, delay: index * 40 }}>
	<!--
		outer div is the group container so focus-within on the action
		buttons can still trigger group-hover-style visibility, without
		the button clicks also firing the card's navigation.
	-->
	<div
		role="button"
		tabindex="0"
		onclick={navigate}
		onkeydown={handleCardKey}
		class="
			group relative w-full text-left rounded-xl overflow-hidden
			bg-[var(--color-surface-1)] border border-[var(--color-border)]
			backdrop-blur-md cursor-pointer
			transition-all duration-200 ease-out
			hover:-translate-y-0.5
			hover:border-[var(--color-accent)]/30
			hover:shadow-[0_8px_32px_color-mix(in_srgb,var(--color-accent)_12%,transparent)]
			focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]
		"
		style="border-left: 4px solid {color};"
		aria-label="Open project {name}"
	>
		<!-- ── quick action buttons (top-right corner) ───────────────────────── -->
		<div
			class="
				absolute top-2.5 right-2.5 flex items-center gap-1
				opacity-0 group-hover:opacity-100 focus-within:opacity-100
				transition-opacity duration-150
			"
		>
			<!-- rename -->
			<button
				type="button"
				onclick={handleRename}
				class="
					w-7 h-7 flex items-center justify-center rounded-md
					glass border border-[var(--color-border)]
					text-[var(--color-muted)] hover:text-[var(--color-accent)]
					hover:shadow-[0_0_10px_var(--color-accent-glow)]
					hover:border-[var(--color-accent)]/30
					transition-all duration-150
				"
				aria-label="Rename project"
				tabindex="0"
			>
				<Pencil size={12} />
			</button>

			<!-- delete -->
			<button
				type="button"
				onclick={handleDelete}
				class="
					w-7 h-7 flex items-center justify-center rounded-md
					glass border border-[var(--color-border)]
					text-[var(--color-muted)] hover:text-[var(--color-danger)]
					hover:shadow-[0_0_10px_var(--color-danger-glow)]
					hover:border-[var(--color-danger)]/30
					transition-all duration-150
				"
				aria-label="Delete project"
				tabindex="0"
			>
				<Trash2 size={12} />
			</button>
		</div>

		<!-- ── card body ────────────────────────────────────────────────────── -->
		<div class="px-5 py-4 flex flex-col gap-3">
			<h3 class="text-base font-semibold text-[var(--color-text)] font-[var(--font-display)] leading-tight truncate group-hover:text-white transition-colors pr-16">
				{name}
			</h3>

			<div>
				<Badge color="muted">
					{#snippet children()}
						{tableCount} {tableCount === 1 ? 'table' : 'tables'}
					{/snippet}
				</Badge>
			</div>

			<p class="text-xs text-[var(--color-muted)] font-[var(--font-body)]">
				edited {relative}
			</p>
		</div>
	</div>
</div>
