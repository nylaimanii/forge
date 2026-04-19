<script lang="ts">
	import { ChevronUp, ChevronDown, Download, Filter, X, Plus } from 'lucide-svelte';
	import Tooltip from '$components/ui/Tooltip.svelte';
	import RecordDetail from '$components/visualize/RecordDetail.svelte';

	interface Props {
		rows:       unknown[];
		columns:    string[];
		tableName?: string;   // needed for export filename + record detail SQL
	}

	let { rows, columns, tableName = '' }: Props = $props();

	// ── search ────────────────────────────────────────────────────────────────
	let search = $state('');

	// ── column filter mode ────────────────────────────────────────────────────
	let filterMode = $state(false);
	let filterValues = $state<Record<string, string>>({});

	let anyFilter = $derived(Object.values(filterValues).some((v) => v.trim() !== ''));

	function clearFilters() { filterValues = {}; }

	// ── unified filtered set (global search + per-column filters) ────────────
	let filtered = $derived(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let result: any[] = rows as any[];

		// global search
		if (search.trim()) {
			result = result.filter((row) =>
				columns.some((col) => {
					const v = row[col];
					return v !== null && v !== undefined && String(v).toLowerCase().includes(search.toLowerCase());
				})
			);
		}

		// per-column filters
		for (const [col, val] of Object.entries(filterValues)) {
			if (!val.trim()) continue;
			const lower = val.toLowerCase();
			result = result.filter((row) => {
				const v = row[col];
				return v !== null && v !== undefined && String(v).toLowerCase().includes(lower);
			});
		}

		return result;
	});

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
		if (!sortCol) return filtered();
		const col = sortCol;
		const dir = sortDir;
		return [...filtered()].sort((a, b) => {
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
		void filterValues;
		currentPage = 0;
	});

	let pageCount  = $derived(Math.max(1, Math.ceil(sorted().length / PAGE_SIZE)));
	let pageRows   = $derived(sorted().slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE));
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

	// ── CSV export ────────────────────────────────────────────────────────────
	function exportCSV() {
		if (columns.length === 0) return;
		const escape = (v: unknown) => {
			const s = v === null || v === undefined ? '' : String(v);
			return s.includes(',') || s.includes('"') || s.includes('\n')
				? `"${s.replace(/"/g, '""')}"`
				: s;
		};
		const header = columns.map(escape).join(',');
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const body   = (rows as any[]).map((row) => columns.map((c) => escape(row[c])).join(','));
		const csv    = [header, ...body].join('\n');
		const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url    = URL.createObjectURL(blob);
		const a      = document.createElement('a');
		const date   = new Date().toISOString().slice(0, 10);
		a.href       = url;
		a.download   = `${tableName || 'export'}_${date}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// ── record detail panel ───────────────────────────────────────────────────
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let detailRow = $state<any | null | 'new'>(undefined); // undefined = closed
	let detailOpen = $derived(detailRow !== undefined);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function openDetail(row: any) { detailRow = row; }
	function openNew()            { detailRow = null; }   // null = new record mode
	function closeDetail()        { detailRow = undefined; }

	// when a record is saved/deleted we don't invalidate server data here —
	// the parent visualize page handles data loading, so just close the panel
	// and the parent can call loadData() again if needed.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function handleSave(updated: any) {
		// update the row in the local rows array if it exists
		void updated; // parent page will reload data
		closeDetail();
	}

	function handleDelete() { closeDetail(); }
</script>

<div class="flex flex-col h-full relative">
	<!-- toolbar -->
	<div class="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)]">
		<!-- global search -->
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

		<!-- row count label -->
		{#if rows.length > 0}
			<span class="text-[10px] text-[var(--color-muted)] font-[var(--font-ui)] shrink-0">
				{anyFilter || search.trim() ? `${sorted().length} of ${rows.length}` : rows.length} rows
			</span>
		{/if}

		<div class="flex-1"></div>

		<!-- clear filters -->
		{#if anyFilter}
			<button
				type="button"
				onclick={clearFilters}
				class="flex items-center gap-1 text-[10px] text-[var(--color-muted)] hover:text-[var(--color-danger)] font-[var(--font-ui)] transition-colors"
			>
				<X size={10} /> clear filters
			</button>
		{/if}

		<!-- filter mode toggle -->
		<Tooltip label="column filters" position="top">
			<button
				type="button"
				onclick={() => { filterMode = !filterMode; if (!filterMode) clearFilters(); }}
				class="p-1.5 rounded-md text-xs font-[var(--font-ui)] transition-colors {filterMode ? 'text-[var(--color-electric)] bg-[var(--color-electric-dim)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'}"
				aria-label="Toggle column filters"
			>
				<Filter size={13} />
			</button>
		</Tooltip>

		<!-- new record button -->
		{#if tableName}
			<Tooltip label="new record" position="top">
				<button
					type="button"
					onclick={openNew}
					class="p-1.5 rounded-md text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-electric)] hover:bg-[var(--color-electric-dim)] transition-colors"
					aria-label="New record"
				>
					<Plus size={13} />
				</button>
			</Tooltip>
		{/if}

		<!-- CSV export -->
		<Tooltip label="export CSV" position="top">
			<button
				type="button"
				onclick={exportCSV}
				disabled={rows.length === 0}
				class="p-1.5 rounded-md text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-electric)] hover:bg-[var(--color-electric-dim)] disabled:opacity-30 transition-colors"
				aria-label="Export CSV"
			>
				<Download size={13} />
			</button>
		</Tooltip>
	</div>

	<!-- scrollable table — top border turns electric when filter mode is on -->
	<div class="flex-1 overflow-auto" style={filterMode ? 'border-top: 2px solid var(--color-electric)' : ''}>
		<table class="w-full text-xs font-[var(--font-body)] border-collapse">
			<thead>
				<!-- column header row -->
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

				<!-- per-column filter inputs (shown when filterMode is on) -->
				{#if filterMode}
					<tr>
						{#each columns as col}
							<th class="px-2 py-1 bg-[var(--color-surface-2)] border-b border-[var(--color-electric)]/30">
								<input
									type="text"
									placeholder="filter..."
									bind:value={filterValues[col]}
									class="
										w-full bg-[var(--color-surface-1)] border border-[var(--color-border)]
										rounded-md px-2 py-1 text-xs font-[var(--font-body)] text-[var(--color-text)]
										placeholder:text-[var(--color-muted)] outline-none
										focus:border-[var(--color-electric)] transition-colors
									"
								/>
							</th>
						{/each}
					</tr>
				{/if}
			</thead>

			<tbody>
				{#each pageRows as row, i}
					<!-- clicking a row opens the record detail panel -->
					<tr
						class="cursor-pointer hover:bg-white/[0.03] transition-colors {i % 2 === 0 ? '' : 'bg-white/[0.02]'}"
						onclick={() => tableName ? openDetail(row) : undefined}
					>
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
										<button type="button" onclick={(e) => { e.stopPropagation(); toggleExpand(expKey); }} class="ml-1 text-[var(--color-accent)] hover:underline">show less</button>
									{:else}
										<span class="truncate block">{raw.slice(0, 80)}…</span>
										<button type="button" onclick={(e) => { e.stopPropagation(); toggleExpand(expKey); }} class="text-[var(--color-accent)] hover:underline">show more</button>
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
							{search || anyFilter ? 'no rows match your filters' : 'no rows'}
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

<!-- record detail slide-in panel -->
{#if detailOpen}
	<RecordDetail
		row={detailRow}
		{columns}
		{tableName}
		onclose={closeDetail}
		onSave={handleSave}
		onDelete={handleDelete}
	/>
{/if}
