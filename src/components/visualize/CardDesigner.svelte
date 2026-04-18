<script lang="ts">
	import { X } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import type { CardConfig } from './PokemonCard.svelte';

	interface Props {
		columns: string[];
		config:  CardConfig;
		onSave:  (config: CardConfig) => void;
		onClose: () => void;
	}

	let { columns, config, onSave, onClose }: Props = $props();

	const SLOTS: { key: keyof CardConfig; label: string; hint: string }[] = [
		{ key: 'titleField',    label: 'title',    hint: 'main card heading' },
		{ key: 'subtitleField', label: 'subtitle', hint: 'secondary text' },
		{ key: 'imageField',    label: 'image',    hint: 'URL field for card art' },
		{ key: 'typeField',     label: 'type',     hint: 'sets card color / badge' },
		{ key: 'stat1Field',    label: 'stat 1',   hint: 'first stat row' },
		{ key: 'stat2Field',    label: 'stat 2',   hint: 'second stat row' },
		{ key: 'stat3Field',    label: 'stat 3',   hint: 'third stat row' },
	];

	let local = $state<CardConfig>({ ...config });

	function handleSave() {
		onSave({ ...local });
	}
</script>

<aside
	class="
		w-[280px] shrink-0 flex flex-col
		border-l border-[var(--color-border)]
		bg-[var(--color-surface-1)] overflow-hidden
	"
>
	<!-- header -->
	<div class="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)] shrink-0">
		<h3 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)]">card designer</h3>
		<button
			type="button"
			onclick={onClose}
			class="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-all"
			aria-label="Close designer"
		>
			<X size={13} />
		</button>
	</div>

	<!-- slots -->
	<div class="flex-1 overflow-y-auto py-3 px-4 flex flex-col gap-3">
		{#each SLOTS as slot}
			<div class="flex flex-col gap-1">
				<label class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)]">
					{slot.label}
					<span class="normal-case tracking-normal ml-1 text-[var(--color-muted)]/60">{slot.hint}</span>
				</label>
				<select
					value={local[slot.key] ?? ''}
					onchange={(e) => (local = { ...local, [slot.key]: (e.target as HTMLSelectElement).value || undefined })}
					class="
						w-full text-xs bg-[var(--color-surface-2)] text-[var(--color-text)]
						border border-[var(--color-border)] rounded-lg px-2 py-1.5
						font-[var(--font-body)] focus:outline-none focus:border-[var(--color-accent)]
						transition-colors cursor-pointer
					"
				>
					<option value="">(none)</option>
					{#each columns as col}
						<option value={col} selected={local[slot.key] === col}>{col}</option>
					{/each}
				</select>
			</div>
		{/each}
	</div>

	<!-- save footer -->
	<div class="shrink-0 px-4 py-3 border-t border-[var(--color-border)]">
		<Button type="button" variant="primary" size="sm" onclick={handleSave} class="w-full justify-center">
			{#snippet children()}save config{/snippet}
		</Button>
	</div>
</aside>
