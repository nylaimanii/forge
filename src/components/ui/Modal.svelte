<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		open:     boolean;
		title?:   string;
		onclose?: () => void;
		children?: Snippet;
		footer?:   Snippet;
	}

	let { open, title, onclose, children, footer }: Props = $props();

	// close on backdrop click
	function handleBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose?.();
	}

	// close on Escape key
	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose?.();
	}
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
	<!-- backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
		onclick={handleBackdrop}
		transition:fade={{ duration: 150 }}
	>
		<!-- panel -->
		<div
			class="glass w-full max-w-lg rounded-2xl shadow-2xl shadow-black/50"
			transition:scale={{ start: 0.95, duration: 180 }}
		>
			{#if title}
				<div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
					<h2 class="text-base font-semibold text-[var(--color-text)] font-[var(--font-display)]">{title}</h2>
					<button
						onclick={onclose}
						class="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-md hover:bg-white/5"
						aria-label="Close"
					>
						<!-- simple × -->
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
							<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</button>
				</div>
			{/if}

			<div class="px-6 py-5">
				{#if children}
					{@render children()}
				{/if}
			</div>

			{#if footer}
				<div class="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}
