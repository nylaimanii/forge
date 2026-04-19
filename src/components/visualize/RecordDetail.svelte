<script lang="ts">
	import { fly } from 'svelte/transition';
	import { X, Save, Trash2 } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import { showToast } from '$lib/stores/toasts';
	import { page } from '$app/stores';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		row: any | null;                   // null = new record
		columns: string[];
		tableName: string;
		onclose: () => void;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		onSave: (updated: any) => void;
		onDelete: () => void;
	}

	let { row, columns, tableName, onclose, onSave, onDelete }: Props = $props();

	const isNew = $derived(row === null);

	// local editable copy
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let local = $state<Record<string, any>>({});
	let dirty = $state(false);
	let saving = $state(false);
	let confirmDelete = $state(false);

	// reset when row prop changes
	$effect(() => {
		if (row !== null) {
			local = { ...row };
		} else {
			// new record — all columns null
			local = Object.fromEntries(columns.map((c) => [c, '']));
		}
		dirty = false;
		confirmDelete = false;
	});

	function markDirty() { dirty = true; }

	// ── determine the primary key column ─────────────────────────────────────
	// heuristic: column named 'id' or the first column
	const pkCol = $derived(columns.find((c) => c === 'id') ?? columns[0] ?? 'id');

	// ── save (UPDATE or INSERT) ───────────────────────────────────────────────
	async function doSave() {
		saving = true;
		try {
			let sql: string;

			if (isNew) {
				// INSERT — skip empty values
				const filled = columns.filter((c) => local[c] !== '' && local[c] !== null && local[c] !== undefined);
				const colList = filled.map(c => `"${c}"`).join(', ');
				const valList = filled.map(c => {
					const v = local[c];
					if (v === null || v === '' || String(v).toLowerCase() === 'null') return 'NULL';
					return `'${String(v).replace(/'/g, "''")}'`;
				}).join(', ');
				sql = `INSERT INTO "${tableName}" (${colList}) VALUES (${valList}) RETURNING *;`;
			} else {
				// UPDATE by primary key
				const setClauses = columns
					.filter((c) => c !== pkCol)
					.map((c) => {
						const v = local[c];
						const val = (v === null || v === undefined || String(v).toLowerCase() === 'null')
							? 'NULL'
							: `'${String(v).replace(/'/g, "''")}'`;
						return `"${c}" = ${val}`;
					})
					.join(', ');

				const pkVal = row[pkCol];
				sql = `UPDATE "${tableName}" SET ${setClauses} WHERE "${pkCol}" = '${String(pkVal).replace(/'/g, "''")}' RETURNING *;`;
			}

			const res = await fetch('/api/sql/mutate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sql, projectId: $page.params.id }),
			});

			const payload = await res.json();
			if (!res.ok || payload.error) {
				showToast(payload.error ?? 'save failed', 'error');
			} else {
				const returned = payload.rows?.[0] ?? local;
				showToast(isNew ? 'record inserted' : 'record saved', 'success');
				dirty = false;
				onSave(returned);
			}
		} finally {
			saving = false;
		}
	}

	// ── delete ────────────────────────────────────────────────────────────────
	async function doDelete() {
		if (!confirmDelete) { confirmDelete = true; return; }
		saving = true;
		try {
			const pkVal = row[pkCol];
			const sql = `DELETE FROM "${tableName}" WHERE "${pkCol}" = '${String(pkVal).replace(/'/g, "''")}';`;
			const res = await fetch('/api/sql/mutate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sql, projectId: $page.params.id }),
			});
			const payload = await res.json();
			if (!res.ok || payload.error) {
				showToast(payload.error ?? 'delete failed', 'error');
			} else {
				showToast('record deleted', 'success');
				onDelete();
			}
		} finally {
			saving = false;
		}
	}

	// long text threshold
	function isLong(val: unknown): boolean {
		return typeof val === 'string' && (val.length > 80 || val.includes('\n'));
	}
</script>

<!-- slide-in panel from right -->
<div
	class="fixed right-0 top-14 bottom-0 w-80 z-30 flex flex-col bg-[var(--color-surface-1)] border-l border-[var(--color-border)] shadow-2xl shadow-black/40"
	transition:fly={{ x: 320, duration: 200 }}
>
	<!-- header -->
	<div class="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
		<h2 class="text-sm font-bold font-[var(--font-display)] text-[var(--color-text)]">
			{isNew ? 'new record' : 'record detail'}
		</h2>
		<button
			onclick={onclose}
			class="p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-colors"
			aria-label="Close"
		>
			<X size={14} />
		</button>
	</div>

	<!-- body: scrollable field list -->
	<div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
		{#each columns as col}
			<div>
				<label class="block text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] mb-1">{col}</label>
				{#if typeof local[col] === 'boolean'}
					<input
						type="checkbox"
						checked={local[col]}
						onchange={(e) => { local[col] = (e.target as HTMLInputElement).checked; markDirty(); }}
						class="w-4 h-4"
					/>
				{:else if isLong(local[col]) || col === 'id'}
					<textarea
						value={String(local[col] ?? '')}
						readonly={col === pkCol && !isNew}
						oninput={(e) => { local[col] = (e.target as HTMLTextAreaElement).value; markDirty(); }}
						class="
							w-full bg-[var(--color-surface-2)] border border-[var(--color-border)]
							rounded-lg px-2.5 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)]
							outline-none focus:border-[var(--color-electric)] resize-none h-20 transition-colors
							{col === pkCol && !isNew ? 'opacity-50 cursor-not-allowed' : ''}
						"
					></textarea>
				{:else}
					<input
						type="text"
						value={String(local[col] ?? '')}
						readonly={col === pkCol && !isNew}
						oninput={(e) => { local[col] = (e.target as HTMLInputElement).value; markDirty(); }}
						class="
							w-full bg-[var(--color-surface-2)] border border-[var(--color-border)]
							rounded-lg px-2.5 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)]
							outline-none focus:border-[var(--color-electric)] transition-colors
							{col === pkCol && !isNew ? 'opacity-50 cursor-not-allowed' : ''}
						"
					/>
				{/if}
			</div>
		{/each}
	</div>

	<!-- footer -->
	<div class="shrink-0 px-4 py-3 border-t border-[var(--color-border)] flex flex-col gap-2">
		<Button variant="primary" size="sm" onclick={doSave} disabled={(!dirty && !isNew) || saving}>
			{#snippet icon()}<Save size={12} />{/snippet}
			{#snippet children()}{saving ? 'saving...' : (isNew ? 'insert record' : 'save changes')}{/snippet}
		</Button>

		{#if !isNew}
			<Button
				variant={confirmDelete ? 'danger' : 'ghost'}
				size="sm"
				onclick={doDelete}
				disabled={saving}
			>
				{#snippet icon()}<Trash2 size={12} />{/snippet}
				{#snippet children()}{confirmDelete ? 'confirm delete' : 'delete record'}{/snippet}
			</Button>
		{/if}
	</div>
</div>
