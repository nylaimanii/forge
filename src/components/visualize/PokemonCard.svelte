<script lang="ts">
	export interface CardConfig {
		titleField?:    string;
		subtitleField?: string;
		imageField?:    string;
		typeField?:     string;
		stat1Field?:    string;
		stat2Field?:    string;
		stat3Field?:    string;
	}

	interface Props {
		row:        any;
		config:     CardConfig;
		columns:    string[];
		maxValues?: Record<string, number>; // for progress bars
	}

	let { row, config, columns, maxValues = {} }: Props = $props();

	// ── gradient presets ──────────────────────────────────────────────────────
	const GRADIENTS = [
		{ from: '#6c63ff', to: '#a855f7' }, // indigo→purple
		{ from: '#00f5d4', to: '#0891b2' }, // cyan→teal
		{ from: '#ff4d6d', to: '#fb923c' }, // coral→orange
		{ from: '#ffb84d', to: '#eab308' }, // amber→yellow
		{ from: '#7dd87d', to: '#10b981' }, // mint→emerald
		{ from: '#b784ff', to: '#ec4899' }, // violet→pink
	];

	function hashStr(s: string): number {
		let h = 0;
		for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
		return h;
	}

	let typeValue   = $derived(config.typeField ? String(row[config.typeField] ?? '') : '');
	let gradient    = $derived(GRADIENTS[hashStr(typeValue || 'default') % GRADIENTS.length]);
	let titleValue  = $derived(config.titleField    ? String(row[config.titleField]    ?? '—') : (row[columns[0]] != null ? String(row[columns[0]]) : '—'));
	let subtitleVal = $derived(config.subtitleField ? String(row[config.subtitleField] ?? '') : '');
	let imageValue  = $derived(config.imageField    ? String(row[config.imageField]    ?? '') : '');

	const stat1 = $derived(config.stat1Field ? { label: (config.stat1Field).slice(0, 8), value: row[config.stat1Field] } : null);
	const stat2 = $derived(config.stat2Field ? { label: (config.stat2Field).slice(0, 8), value: row[config.stat2Field] } : null);
	const stat3 = $derived(config.stat3Field ? { label: (config.stat3Field).slice(0, 8), value: row[config.stat3Field] } : null);

	function isImageURL(s: string): boolean {
		return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)(\?.*)?$/i.test(s);
	}

	function initials(title: string): string {
		return title.trim().slice(0, 2).toUpperCase() || '??';
	}

	function statPercent(field: string, value: unknown): number {
		if (typeof value !== 'number') return 0;
		const max = maxValues[field] ?? value;
		return max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
	}
</script>

<div
	class="
		relative w-[200px] rounded-2xl overflow-hidden select-none
		border-2 transition-all duration-200
		hover:-translate-y-1 cursor-default
	"
	style="
		border-color: {gradient.from};
		box-shadow: 0 0 0 0 transparent;
	"
	onmouseenter={(e) => {
		(e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${gradient.from}40`;
	}}
	onmouseleave={(e) => {
		(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 transparent';
	}}
	role="article"
>
	<!-- gradient header (top 40%) -->
	<div
		class="relative flex items-center justify-center"
		style="
			height: 110px;
			background: linear-gradient(135deg, {gradient.from}, {gradient.to});
		"
	>
		<!-- type badge top-right -->
		{#if typeValue}
			<span
				class="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold font-[var(--font-ui)] text-white"
				style="background: {gradient.from}cc;"
			>
				{typeValue}
			</span>
		{/if}

		<!-- image or initials -->
		{#if imageValue && isImageURL(imageValue)}
			<img
				src={imageValue}
				alt={titleValue}
				class="w-16 h-16 rounded-xl object-cover shadow-md"
			/>
		{:else}
			<div
				class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold font-[var(--font-display)] text-white shadow-md"
				style="background: rgba(0,0,0,0.25);"
			>
				{initials(titleValue)}
			</div>
		{/if}
	</div>

	<!-- card body -->
	<div class="px-3 py-2.5 flex flex-col gap-1.5 bg-[var(--color-surface-1)]">
		<!-- title -->
		<p class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)] truncate leading-tight">
			{titleValue}
		</p>

		<!-- subtitle -->
		{#if subtitleVal}
			<p class="text-[11px] text-[var(--color-muted)] font-[var(--font-ui)] truncate">
				{subtitleVal}
			</p>
		{/if}

		<!-- stats -->
		{#each [stat1, stat2, stat3].filter(Boolean) as stat}
			{#if stat}
				<div class="flex flex-col gap-0.5 mt-0.5">
					<div class="flex items-center justify-between">
						<span class="text-[10px] uppercase tracking-wide text-[var(--color-muted)] font-[var(--font-ui)]">{stat.label}</span>
						<span class="text-[11px] font-bold text-[var(--color-text)] font-[var(--font-body)]">
							{stat.value ?? '—'}
						</span>
					</div>
					{#if typeof stat.value === 'number' && (config.stat1Field || config.stat2Field || config.stat3Field)}
						{@const pct = statPercent(
							stat.label === (config.stat1Field ?? '').slice(0, 8) ? (config.stat1Field ?? '') :
							stat.label === (config.stat2Field ?? '').slice(0, 8) ? (config.stat2Field ?? '') :
							(config.stat3Field ?? ''),
							stat.value
						)}
						<div class="w-full h-1 rounded-full bg-white/10 overflow-hidden">
							<div
								class="h-full rounded-full transition-all duration-500"
								style="width: {pct}%; background: {gradient.from};"
							></div>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>
