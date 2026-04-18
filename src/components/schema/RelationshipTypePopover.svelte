<script lang="ts">
	import { X } from 'lucide-svelte';

	type RelationType = 'one-to-one' | 'one-to-many' | 'many-to-many';

	interface Props {
		open:      boolean;
		onconfirm: (type: RelationType) => void;
		oncancel:  () => void;
	}

	let { open, onconfirm, oncancel }: Props = $props();

	let selected = $state<RelationType>('one-to-many');

	const options: { value: RelationType; label: string; desc: string }[] = [
		{ value: 'one-to-one',   label: '1 → 1',   desc: 'one-to-one' },
		{ value: 'one-to-many',  label: '1 → N',   desc: 'one-to-many' },
		{ value: 'many-to-many', label: 'N → N',   desc: 'many-to-many' },
	];

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') oncancel();
		if (e.key === 'Enter')  onconfirm(selected);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- backdrop -->
	<div
		class="fixed inset-0 z-40"
		role="presentation"
		onclick={oncancel}
	></div>

	<!-- centered glass panel -->
	<div
		class="
			fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
			glass border border-[var(--color-border)] rounded-xl
			w-[280px] p-4 shadow-2xl
		"
		role="dialog"
		aria-modal="true"
		aria-label="Choose relationship type"
	>
		<!-- header -->
		<div class="flex items-center justify-between mb-3">
			<h3 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)]">
				relationship type
			</h3>
			<button
				type="button"
				onclick={oncancel}
				class="w-6 h-6 flex items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
				aria-label="Cancel"
			>
				<X size={12} />
			</button>
		</div>

		<!-- options -->
		<div class="flex flex-col gap-1.5 mb-4">
			{#each options as opt}
				<button
					type="button"
					onclick={() => (selected = opt.value)}
					class="
						flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all
						{selected === opt.value
							? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)] text-[var(--color-text)]'
							: 'border-[var(--color-border)] hover:border-white/20 text-[var(--color-muted)] hover:text-[var(--color-text)]'
						}
					"
				>
					<span class="text-sm font-bold font-[var(--font-body)] tabular-nums w-10 shrink-0">
						{opt.label}
					</span>
					<span class="text-xs font-[var(--font-ui)]">{opt.desc}</span>
				</button>
			{/each}
		</div>

		<!-- confirm button -->
		<button
			type="button"
			onclick={() => onconfirm(selected)}
			class="
				w-full py-2 rounded-lg text-xs font-bold font-[var(--font-ui)]
				bg-[var(--color-accent)] text-white
				hover:opacity-90 transition-opacity
			"
		>
			confirm
		</button>
	</div>
{/if}
