<script lang="ts">
	import { Sliders } from 'lucide-svelte';
	import PokemonCard from './PokemonCard.svelte';
	import CardDesigner from './CardDesigner.svelte';
	import type { CardConfig } from './PokemonCard.svelte';

	interface Props {
		rows:          any[];
		columns:       string[];
		tableConfig:   { config: CardConfig } | null;
		tableName:     string;
		onSaveConfig:  (config: CardConfig) => void;
	}

	let { rows, columns, tableConfig, tableName, onSaveConfig }: Props = $props();

	let showDesigner = $state(false);

	// derive config: use saved config or auto-map from columns
	let cardConfig = $derived<CardConfig>(
		(tableConfig?.config && Object.keys(tableConfig.config).length > 0)
			? (tableConfig.config as CardConfig)
			: (() => {
				const stringCols = columns.filter((c) => !['id', 'created_at', 'updated_at'].includes(c));
				const result: CardConfig = {};
				if (stringCols[0]) result.titleField    = stringCols[0];
				if (stringCols[1]) result.subtitleField = stringCols[1];
				const firstRow = rows[0] ?? {};
				for (const col of columns) {
					if (typeof firstRow[col] === 'number' && !result.stat1Field) {
						result.stat1Field = col;
					} else if (typeof firstRow[col] === 'number' && !result.stat2Field && col !== result.stat1Field) {
						result.stat2Field = col;
					}
				}
				return result;
			})()
	);

	// pre-compute max values per numeric column for progress bars
	let maxValues = $derived<Record<string, number>>(
		(() => {
			const mv: Record<string, number> = {};
			for (const col of columns) {
				const nums = rows.map((r) => r[col]).filter((v) => typeof v === 'number') as number[];
				if (nums.length > 0) mv[col] = Math.max(...nums);
			}
			return mv;
		})()
	);

	function handleSave(config: CardConfig) {
		showDesigner = false;
		onSaveConfig(config);
	}
</script>

<div class="flex h-full overflow-hidden">
	<!-- cards area -->
	<div class="flex-1 flex flex-col overflow-hidden">
		<!-- toolbar -->
		<div class="shrink-0 flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)]">
			<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
				{rows.length} card{rows.length !== 1 ? 's' : ''} · {tableName}
			</p>
			<button
				type="button"
				onclick={() => (showDesigner = !showDesigner)}
				class="
					flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
					font-[var(--font-ui)] transition-all
					{showDesigner
						? 'text-[var(--color-accent)] bg-[var(--color-accent-glow)]'
						: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
					}
				"
			>
				<Sliders size={12} />
				card designer
			</button>
		</div>

		<!-- grid -->
		<div class="flex-1 overflow-auto p-4">
			<div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, 200px);">
				{#each rows as row, i}
					<div class="animate-fade-up" style="animation-delay: {Math.min(i * 30, 600)}ms">
						<PokemonCard
							{row}
							config={cardConfig}
							{columns}
							{maxValues}
						/>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- card designer panel -->
	{#if showDesigner}
		<CardDesigner
			{columns}
			config={cardConfig}
			onSave={handleSave}
			onClose={() => (showDesigner = false)}
		/>
	{/if}
</div>
