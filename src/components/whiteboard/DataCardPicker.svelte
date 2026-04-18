<script lang="ts">
	import { page } from '$app/stores';
	import Modal from '$components/ui/Modal.svelte';
	import Button from '$components/ui/Button.svelte';
	import { Database, RefreshCw, ChevronLeft } from 'lucide-svelte';

	export interface DataCardConfig {
		tableId:   string;
		tableName: string;
		rowData:   Record<string, unknown>;
		fields:    string[];
	}

	interface TableEntry {
		id:     string;
		name:   string;
		fields: { id: string; name: string; type: string }[];
	}

	interface Props {
		open:      boolean;
		tables:    TableEntry[];
		oninsert:  (card: DataCardConfig) => void;
		onclose:   () => void;
	}

	let { open, tables, oninsert, onclose }: Props = $props();

	// ── step machine ──────────────────────────────────────────────────────────
	type Step = 'pick-table' | 'pick-row';
	let step            = $state<Step>('pick-table');
	let selectedTable   = $state<TableEntry | null>(null);
	let subTab          = $state<'db' | 'manual'>('db');

	// db tab state
	let dbRows          = $state<Record<string, unknown>[]>([]);
	let dbLoading       = $state(false);
	let dbError         = $state('');
	let selectedRow     = $state<Record<string, unknown> | null>(null);

	// manual tab state
	let manualValues    = $state<Record<string, string>>({});

	function pickTable(t: TableEntry) {
		selectedTable = t;
		step          = 'pick-row';
		dbRows        = [];
		dbError       = '';
		selectedRow   = null;
		manualValues  = Object.fromEntries(t.fields.map((f) => [f.name, '']));
	}

	function goBack() {
		step          = 'pick-table';
		selectedTable = null;
	}

	async function loadRows() {
		if (!selectedTable) return;
		dbLoading = true;
		dbError   = '';

		const res = await fetch('/api/sql/run', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({
				sql:       `SELECT * FROM ${selectedTable.name} LIMIT 50`,
				projectId: $page.params.id,
			}),
		});
		const payload = await res.json();
		dbLoading = false;

		if (!res.ok || payload.error) {
			dbError = payload.error ?? 'failed to load rows';
			return;
		}
		dbRows = payload.rows ?? [];
	}

	function insertCard() {
		if (!selectedTable) return;

		const fields  = selectedTable.fields.map((f) => f.name);
		let   rowData: Record<string, unknown>;

		if (subTab === 'db' && selectedRow) {
			rowData = selectedRow;
		} else {
			rowData = Object.fromEntries(
				fields.map((f) => [f, manualValues[f] ?? ''])
			);
		}

		oninsert({ tableId: selectedTable.id, tableName: selectedTable.name, rowData, fields });
		// reset
		step          = 'pick-table';
		selectedTable = null;
		selectedRow   = null;
		dbRows        = [];
		manualValues  = {};
	}

	let canInsert = $derived(
		selectedTable !== null &&
		(subTab === 'manual' || (subTab === 'db' && selectedRow !== null))
	);

	// preview: first 3 field values from a row
	function rowPreview(row: Record<string, unknown>, fields: string[]): string {
		return fields.slice(0, 3)
			.map((f) => String(row[f] ?? ''))
			.filter(Boolean)
			.join(' · ');
	}
</script>

<Modal {open} title="insert data card" onclose={onclose}>
	{#snippet children()}
		<div class="flex flex-col gap-4" style="min-height: 340px;">

			{#if step === 'pick-table'}
				<!-- STEP 1: pick a table -->
				{#if tables.length === 0}
					<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] italic">
						no tables in your schema yet — add some in the Schema tab first.
					</p>
				{:else}
					<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">choose a table</p>
					<div class="flex flex-col gap-1">
						{#each tables as table (table.id)}
							<button
								type="button"
								onclick={() => pickTable(table)}
								class="
									flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left
									text-sm font-[var(--font-body)] transition-all
									hover:bg-[var(--color-accent-glow)] hover:text-[var(--color-text)]
									text-[var(--color-muted)] border border-transparent
									hover:border-[var(--color-accent)]/30
								"
							>
								<Database size={14} class="text-[var(--color-accent)] shrink-0" />
								<span class="flex-1 truncate">{table.name}</span>
								<span class="text-xs text-[var(--color-muted)]">{table.fields.length} fields</span>
							</button>
						{/each}
					</div>
				{/if}

			{:else}
				<!-- STEP 2: pick row or enter manual data -->
				<div class="flex items-center gap-2">
					<button
						type="button"
						onclick={goBack}
						class="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors font-[var(--font-ui)]"
					>
						<ChevronLeft size={12} />back
					</button>
					<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">·</span>
					<span class="text-xs font-bold text-[var(--color-text)] font-[var(--font-display)]">
						{selectedTable?.name}
					</span>
				</div>

				<!-- sub-tabs -->
				<div class="flex items-center gap-1 glass rounded-lg p-1 border border-[var(--color-border)] self-start">
					<button
						type="button"
						onclick={() => (subTab = 'db')}
						class="px-3 py-1 rounded-md text-xs font-[var(--font-ui)] transition-all {subTab === 'db' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
					>
						from database
					</button>
					<button
						type="button"
						onclick={() => (subTab = 'manual')}
						class="px-3 py-1 rounded-md text-xs font-[var(--font-ui)] transition-all {subTab === 'manual' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
					>
						manual entry
					</button>
				</div>

				{#if subTab === 'db'}
					<div class="flex flex-col gap-2">
						<Button variant="ghost" size="sm" onclick={loadRows} disabled={dbLoading}>
							{#snippet icon()}<RefreshCw size={12} class={dbLoading ? 'animate-spin' : ''} />{/snippet}
							{#snippet children()}{dbLoading ? 'loading...' : 'load rows'}{/snippet}
						</Button>

						{#if dbError}
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-ui)]">{dbError}</p>
						{/if}

						{#if dbRows.length > 0}
							<div class="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
								{#each dbRows as row, i}
									{@const preview = rowPreview(row, selectedTable?.fields.map(f => f.name) ?? [])}
									<button
										type="button"
										onclick={() => (selectedRow = row)}
										class="
											flex items-start gap-2 w-full px-3 py-2 rounded-lg text-left text-xs
											font-[var(--font-body)] transition-all border
											{selectedRow === row
												? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)] text-[var(--color-text)]'
												: 'border-transparent text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
											}
										"
									>
										<span class="text-[var(--color-muted)] shrink-0 tabular-nums">{i + 1}.</span>
										<span class="truncate">{preview || '(empty row)'}</span>
									</button>
								{/each}
							</div>
						{:else if !dbLoading}
							<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">
								click "load rows" to fetch data from {selectedTable?.name}
							</p>
						{/if}
					</div>

				{:else}
					<!-- manual entry -->
					<div class="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
						{#each selectedTable?.fields ?? [] as field (field.id)}
							<div class="flex flex-col gap-1">
								<label class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)]">
									{field.name} <span class="normal-case tracking-normal opacity-60">{field.type}</span>
								</label>
								<input
									type="text"
									bind:value={manualValues[field.name]}
									placeholder={field.type}
									class="
										w-full text-xs rounded-lg px-3 py-1.5
										bg-[var(--color-surface-2)] text-[var(--color-text)]
										border border-[var(--color-border)] font-[var(--font-body)]
										focus:outline-none focus:border-[var(--color-accent)]
										placeholder:text-[var(--color-muted)] transition-colors
									"
								/>
							</div>
						{/each}
					</div>
				{/if}

				<!-- insert button -->
				<div class="pt-2 border-t border-[var(--color-border)] mt-auto">
					<Button variant="primary" size="sm" onclick={insertCard} disabled={!canInsert}>
						{#snippet icon()}<Database size={12} />{/snippet}
						{#snippet children()}insert card{/snippet}
					</Button>
				</div>
			{/if}
		</div>
	{/snippet}
</Modal>
