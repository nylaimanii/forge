<script lang="ts">
	import { ChevronUp, ChevronDown } from 'lucide-svelte';
	import Tooltip from '$components/ui/Tooltip.svelte';

	interface Props {
		rows:    any[];
		columns: string[];
	}

	let { rows, columns }: Props = $props();

	// ── search ────────────────────────────────────────────────────────────────
	let search = $state('');

	let filtered = $derived(
		search.trim()
			? rows.filter((row) =>
				columns.some((col) => {
					const v = row[col];
					return v !== null && v !== undefined && String(v).toLowerCase().includes(search.toLowerCase());
				})
			)
			: rows
	);

	// ── sort ──────────────────────────────────────────────────────────────────
	let sortCol = $state<string | null>(null);
	let sortDir = $state<'asc' | 'desc'>('asc');

	function toggleSort(col: string) {
		if (sortCol === col) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortCol = col;
			sortDir = 'asc';
		}
	}

	let sorted = $derived(() => {
		if (!sortCol) return filtered;
		const col = sortCol;
		const dir = sortDir;
		return [...filtered].sort((a, b) => {
			const av = a[col];
			const bv = b[col];
			if (av === null || av === undefined) return 1;
			if (bv === null || bv === undefined) return -1;
			const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
			return dir === 'asc' ? cmp : -cmp;
		});
	});

	// ── pagination ────────────────────────────────────────────────────────────
	const PAGE_SIZE = 25;
	let currentPage = $state(0);

	// reset page when filter/sort changes
	$effect(() => {
		void search;
		void sortCol;
		void sortDir;
		currentPage = 0;
	});

	let pageCount = $derived(Math.max(1, Math.ceil(sorted().length / PAGE_SIZE)));
	let pageRows  = $derived(sorted().slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE));
	let rangeStart = $derived(sorted().length === 0 ? 0 : currentPage * PAGE_SIZE + 1);
	let rangeEnd   = $derived(Math.min((currentPage + 1) * PAGE_SIZE, sorted().length));

	// ── expanded long strings ─────────────────────────────────────────────────
	let expanded = $state<Set<string>>(new Set());

	function toggleExpand(key: string) {
		const next = new Set(expanded);
		next.has(key) ? next.delete(key) : next.add(key);
		expanded = next;
	}

	// ── uuid detection ────────────────────────────────────────────────────────
	const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	function isUUID(v: string): boolean { return UUID_RE.test(v); }
</script>

<div class="flex flex-col h-full">
	<!-- search bar -->
	<div class="shrink-0 px-4 py-2 border-b border-[var(--color-border)]">
		<input
			type="search"
			bind:value={search}
			placeholder="search rows..."
			class="
				w-full max-w-xs text-xs rounded-lg px-3 py-1.5
				bg-[var(--color-surface-2)] text-[var(--color-text)]
				border border-[var(--color-border)] font-[var(--font-body)]
				focus:outline-none focus:border-[var(--color-accent)]
				placeholder:text-[var(--color-muted)] transition-colors
			"
		/>
	</div>

	<!-- scrollable table -->
	<div class="flex-1 overflow-auto">
		<table class="w-full text-xs font-[var(--font-body)] border-collapse">
			<thead>
				<tr>
					{#each columns as col}
						<th
							class="
								sticky top-0 px-3 py-2 text-left cursor-pointer
								bg-[var(--color-surface-2)] border-b border-[var(--color-border)]
								whitespace-nowrap select-none transition-colors
								{sortCol === col ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}
								text-[10px] uppercase tracking-wide
							"
							onclick={() => toggleSort(col)}
						>
							<span class="flex items-center gap-1">
								{col}
								{#if sortCol === col}
									{#if sortDir === 'asc'}
										<ChevronUp size={10} />
									{:else}
										<ChevronDown size={10} />
									{/if}
								{/if}
							</span>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each pageRows as row, i}
					<tr class={i % 2 === 0 ? '' : 'bg-white/[0.02]'}>
						{#each columns as col}
							{@const raw = row[col]}
							{@const key = `${i}-${col}`}
							<td class="px-3 py-2 border-b border-[var(--color-border)]/50 text-[var(--color-text)] max-w-[300px]">
								{#if raw === null || raw === undefined}
									<span class="italic text-[var(--color-muted)]">null</span>
								{:else if typeof raw === 'boolean'}
									<span class="
										inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold
										{raw ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}
									">
										{raw ? 'true' : 'false'}
									</span>
								{:else if typeof raw === 'string' && isUUID(raw)}
									<Tooltip label={raw} position="top">
										<span class="font-[var(--font-body)] cursor-help">{raw.slice(0, 8)}…</span>
									</Tooltip>
								{:else if typeof raw === 'string' && raw.length > 80}
									{@const expKey = key}
									{#if expanded.has(expKey)}
										<span class="break-words whitespace-pre-wrap">{raw}</span>
										<button type="button" onclick={() => toggleExpand(expKey)} class="ml-1 text-[var(--color-accent)] hover:underline">show less</button>
									{:else}
										<span class="truncate block">{raw.slice(0, 80)}…</span>
										<button type="button" onclick={() => toggleExpand(expKey)} class="text-[var(--color-accent)] hover:underline">show more</button>
									{/if}
								{:else if typeof raw === 'object'}
									<span class="text-[var(--color-muted)] truncate block">{JSON.stringify(raw)}</span>
								{:else}
									{raw}
								{/if}
							</td>
						{/each}
					</tr>
				{:else}
					<tr>
						<td colspan={columns.length} class="px-4 py-8 text-center text-[var(--color-muted)] font-[var(--font-ui)] text-xs italic">
							{search ? 'no rows match your search' : 'no rows'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- pagination footer -->
	{#if sorted().length > 0}
		<div class="shrink-0 flex items-center justify-between px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-surface-1)]">
			<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
				showing {rangeStart}–{rangeEnd} of {sorted().length} rows
			</span>
			<div class="flex items-center gap-2">
				<button
					type="button"
					disabled={currentPage === 0}
					onclick={() => (currentPage -= 1)}
					class="px-2.5 py-1 rounded text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors"
				>
					prev
				</button>
				<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] tabular-nums">
					{currentPage + 1} / {pageCount}
				</span>
				<button
					type="button"
					disabled={currentPage >= pageCount - 1}
					onclick={() => (currentPage += 1)}
					class="px-2.5 py-1 rounded text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors"
				>
					next
				</button>
			</div>
		</div>
	{/if}
</div>
