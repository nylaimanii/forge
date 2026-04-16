<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { toasts, dismissToast } from '$lib/stores/toasts';

	// icon glyphs per type (inline svgs to avoid extra imports)
	const icons = {
		success: `<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
		error:   `<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
		info:    `<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
	};

	const colorMap = {
		success: 'text-[var(--color-cyan)]   border-[var(--color-cyan)]/20',
		error:   'text-[var(--color-danger)] border-[var(--color-danger)]/20',
		info:    'text-[var(--color-accent)] border-[var(--color-accent)]/20',
	};
</script>

<!-- fixed bottom-right stack -->
<div class="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
	{#each $toasts as toast (toast.id)}
		<div
			class="pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm rounded-xl px-4 py-3 glass border shadow-xl shadow-black/40 {colorMap[toast.type]}"
			in:fly={{ y: 16, duration: 200 }}
			out:fade={{ duration: 150 }}
		>
			<!-- icon -->
			<svg class="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none">
				{@html icons[toast.type]}
			</svg>

			<!-- message -->
			<p class="text-sm text-[var(--color-text)] font-[var(--font-ui)] flex-1 leading-snug">{toast.message}</p>

			<!-- dismiss -->
			<button
				onclick={() => dismissToast(toast.id)}
				class="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
				aria-label="Dismiss"
			>
				<svg class="w-3 h-3" viewBox="0 0 12 12" fill="none">
					<path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
				</svg>
			</button>
		</div>
	{/each}
</div>
