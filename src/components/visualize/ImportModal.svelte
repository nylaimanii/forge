<script lang="ts">
	import Modal from '$components/ui/Modal.svelte';
	import Button from '$components/ui/Button.svelte';
	import { showToast } from '$lib/stores/toasts';
	import { Upload } from 'lucide-svelte';
	import { page } from '$app/stores';

	interface Props {
		open: boolean;
		onclose: () => void;
		tableName?: string;
	}

	let { open, onclose, tableName = '' }: Props = $props();

	// ── state ────────────────────────────────────────────────────────────────
	let csvText   = $state('');
	let targetTable = $state(tableName);
	let parsed    = $state<{ headers: string[]; rows: string[][] } | null>(null);
	let parseError = $state('');
	let importing = $state(false);
	let importError = $state('');

	// keep targetTable in sync if parent changes tableName
	$effect(() => { targetTable = tableName; });

	// ── parse CSV ─────────────────────────────────────────────────────────────
	function parseCSV() {
		parseError = '';
		parsed = null;
		const raw = csvText.trim();
		if (!raw) { parseError = 'paste CSV text above'; return; }

		const lines = raw.split(/\r?\n/).filter((l) => l.trim());
		if (lines.length < 2) { parseError = 'CSV must have at least a header row + one data row'; return; }

		const headers = splitRow(lines[0]);
		const rows = lines.slice(1, 501).map(splitRow); // max 500 rows
		if (rows.length === 0) { parseError = 'no data rows found'; return; }

		parsed = { headers, rows };
	}

	function splitRow(line: string): string[] {
		// simple CSV split — handles quoted fields
		const result: string[] = [];
		let cur = '';
		let inQ = false;
		for (let i = 0; i < line.length; i++) {
			const c = line[i];
			if (c === '"') { inQ = !inQ; }
			else if (c === ',' && !inQ) { result.push(cur); cur = ''; }
			else { cur += c; }
		}
		result.push(cur);
		return result;
	}

	// ── file input ────────────────────────────────────────────────────────────
	function handleFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => { csvText = (ev.target?.result as string) ?? ''; };
		reader.readAsText(file);
	}

	// ── import ────────────────────────────────────────────────────────────────
	async function doImport() {
		if (!parsed || !targetTable.trim()) { importError = 'table name is required'; return; }
		importing = true;
		importError = '';

		// capture in local const to satisfy TypeScript narrowing across async boundary
		const snapshot = parsed;
		try {
			const { headers, rows } = snapshot;
			// build a single INSERT with multiple value tuples — max 500 rows
			const colList = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(', ');
			const valTuples = rows.map((row) =>
				'(' + row.map((v) => {
					const trimmed = v.trim();
					if (trimmed === '' || trimmed.toLowerCase() === 'null') return 'NULL';
					return `'${trimmed.replace(/'/g, "''")}'`;
				}).join(', ') + ')'
			);

			const sql = `INSERT INTO "${targetTable.trim().replace(/"/g, '""')}" (${colList}) VALUES\n${valTuples.join(',\n')};`;

			const res = await fetch('/api/sql/mutate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sql, projectId: $page.params.id }),
			});

			const payload = await res.json();
			if (!res.ok || payload.error) {
				importError = payload.error ?? 'import failed';
			} else {
				showToast(`${snapshot.rows.length} row${snapshot.rows.length !== 1 ? 's' : ''} imported`, 'success');
				onclose();
				// reset
				csvText = '';
				parsed = null;
			}
		} catch (e) {
			importError = String(e);
		} finally {
			importing = false;
		}
	}

	function close() {
		csvText = '';
		parsed = null;
		parseError = '';
		importError = '';
		onclose();
	}
</script>

<Modal {open} title="import CSV" onclose={close}>
	{#snippet children()}
		<div class="flex flex-col gap-4">
			<!-- file picker -->
			<div>
				<label class="block text-xs font-[var(--font-ui)] text-[var(--color-muted)] mb-1.5">
					pick a .csv file
				</label>
				<input
					type="file"
					accept=".csv,text/csv"
					onchange={handleFile}
					class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] file:mr-3 file:py-1 file:px-3 file:rounded-md file:border file:border-[var(--color-border)] file:bg-[var(--color-surface-2)] file:text-xs file:text-[var(--color-text)] file:cursor-pointer"
				/>
			</div>

			<!-- or paste -->
			<div>
				<label class="block text-xs font-[var(--font-ui)] text-[var(--color-muted)] mb-1.5">
					or paste CSV text
				</label>
				<textarea
					bind:value={csvText}
					placeholder="name,age,email&#10;Alice,30,alice@example.com"
					class="
						w-full h-36 bg-[var(--color-surface-2)] border border-[var(--color-border)]
						rounded-xl p-3 text-xs font-[var(--font-body)] text-[var(--color-text)]
						placeholder:text-[var(--color-muted)] outline-none resize-none
						focus:border-[var(--color-electric)] transition-colors
					"
				></textarea>
			</div>

			<!-- parse button -->
			{#if parseError}
				<p class="text-xs text-[var(--color-danger)] font-[var(--font-ui)]">{parseError}</p>
			{/if}
			<Button variant="secondary" size="sm" onclick={parseCSV} disabled={!csvText.trim()}>
				{#snippet children()}parse{/snippet}
			</Button>

			<!-- preview table -->
			{#if parsed}
				<div>
					<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-2">
						{parsed.rows.length} row{parsed.rows.length !== 1 ? 's' : ''} detected — preview (first 5):
					</p>
					<div class="overflow-x-auto rounded-xl border border-[var(--color-border)]">
						<table class="w-full text-xs font-[var(--font-body)] border-collapse">
							<thead>
								<tr>
									{#each parsed.headers as h}
										<th class="px-2 py-1.5 text-left text-[10px] uppercase tracking-wide text-[var(--color-muted)] bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">{h}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each parsed.rows.slice(0, 5) as row, i}
									<tr class={i % 2 === 0 ? '' : 'bg-white/[0.02]'}>
										{#each row as cell}
											<td class="px-2 py-1.5 text-[var(--color-text)] border-b border-[var(--color-border)]/50 max-w-[120px] truncate">{cell}</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- target table name -->
				<div>
					<label class="block text-xs font-[var(--font-ui)] text-[var(--color-muted)] mb-1.5">
						import into table
					</label>
					<input
						type="text"
						bind:value={targetTable}
						placeholder="table_name"
						class="
							w-full bg-[var(--color-surface-2)] border border-[var(--color-border)]
							rounded-lg px-3 py-1.5 text-sm text-[var(--color-text)] font-[var(--font-body)]
							outline-none focus:border-[var(--color-electric)] transition-colors
						"
					/>
				</div>

				{#if importError}
					<p class="text-xs text-[var(--color-danger)] font-[var(--font-ui)]">{importError}</p>
				{/if}

				<Button variant="primary" size="sm" onclick={doImport} disabled={importing || !targetTable.trim()}>
					{#snippet icon()}<Upload size={12} />{/snippet}
					{#snippet children()}
						{importing ? 'importing...' : `import ${parsed?.rows.length ?? 0} row${(parsed?.rows.length ?? 0) !== 1 ? 's' : ''}`}
					{/snippet}
				</Button>
			{/if}
		</div>
	{/snippet}
</Modal>
