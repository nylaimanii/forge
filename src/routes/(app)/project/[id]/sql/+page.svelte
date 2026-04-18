<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { Play, Save, Table, ChevronRight, ChevronLeft, X } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { showToast } from '$lib/stores/toasts';
	import { relativeTime } from '$lib/utils';
	import { initMonaco } from '$lib/monaco';

	let { data }: { data: PageData } = $props();

	// ── local state ───────────────────────────────────────────────────────────
	type QueryRow = Record<string, unknown>;

	let status     = $state<'ready' | 'running' | 'done' | 'error'>('ready');
	let rowCount   = $state(0);
	let errorMsg   = $state('');
	let results    = $state<QueryRow[] | null>(null);
	let columns    = $state<string[]>([]);
	let showSchema = $state(true);
	let saving     = $state(false);

	// history updated locally when we save (initialized once from server data)
	let localHistory = $state<typeof data.history>([]);
	$effect(() => { localHistory = [...data.history]; });

	// expandable tables in schema reference panel
	let expanded = $state<Record<string, boolean>>({});

	// ── Monaco editor ─────────────────────────────────────────────────────────
	let editorContainer: HTMLDivElement | undefined = $state();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let editor: any = null;

	const DEFAULT_SQL = `-- welcome to forge sql editor\n-- cmd+enter (mac) or ctrl+enter (windows) to run\n\nSELECT 1;`;

	onMount(async () => {
		if (!editorContainer) return;

		// pre-fill from ?sql= query param (set by AI mode "run in SQL editor" button)
		const paramSQL  = $page.url.searchParams.get('sql');
		const initialSQL = paramSQL?.trim() || DEFAULT_SQL;

		editor = await initMonaco(editorContainer, {
			language:              'sql',
			value:                 initialSQL,
			fontSize:              13,
			fontFamily:            'DM Mono, monospace',
			lineHeight:            20,
			minimap:               { enabled: false },
			scrollBeyondLastLine:  false,
			automaticLayout:       true,
			padding:               { top: 12, bottom: 12 },
			renderLineHighlight:   'line',
			overviewRulerLanes:    0,
		});

		// cmd+enter / ctrl+enter to run
		editor.addCommand(
			// monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter — use numeric values to avoid import
			2048 | 3, // CtrlCmd = 2048, Enter = 3
			() => runQuery(),
		);
	});

	onDestroy(() => {
		editor?.dispose();
	});

	// ── query execution ───────────────────────────────────────────────────────
	async function runQuery() {
		const sql = editor?.getValue()?.trim() ?? '';
		if (!sql) return;

		status  = 'running';
		results = null;
		columns = [];
		errorMsg = '';

		const projectId = $page.params.id;

		const res = await fetch('/api/sql/run', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ sql, projectId }),
		});

		const payload = await res.json();

		if (!res.ok || payload.error) {
			status   = 'error';
			errorMsg = payload.error ?? 'unknown error';
			return;
		}

		const rows: QueryRow[] = payload.rows ?? [];
		results  = rows;
		columns  = rows.length > 0 ? Object.keys(rows[0]) : [];
		rowCount = rows.length;
		status   = 'done';

		// fire-and-forget save to history
		const body = new URLSearchParams({ sql, source: 'manual' });
		fetch('?/saveQuery', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		}).then(async () => {
			// prepend to local history for instant feedback
			localHistory = [
				{ id: crypto.randomUUID(), sql, source: 'manual', ran_at: new Date().toISOString() },
				...localHistory.slice(0, 49),
			];
		});
	}

	// ── save query explicitly ─────────────────────────────────────────────────
	async function saveQuery() {
		const sql = editor?.getValue()?.trim() ?? '';
		if (!sql) return;
		saving = true;

		const res    = await fetch('?/saveQuery', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body:    new URLSearchParams({ sql, source: 'manual' }),
		});
		saving = false;

		if (res.ok) {
			showToast('query saved', 'success');
			localHistory = [
				{ id: crypto.randomUUID(), sql, source: 'manual', ran_at: new Date().toISOString() },
				...localHistory.slice(0, 49),
			];
		} else {
			showToast('failed to save query', 'error');
		}
	}

	function clearResults() {
		results  = null;
		columns  = [];
		status   = 'ready';
		errorMsg = '';
	}

	function loadSQL(sql: string) {
		editor?.setValue(sql);
		editor?.focus();
	}

	let statusText = $derived(
		status === 'ready'   ? 'ready' :
		status === 'running' ? 'running...' :
		status === 'done'    ? `${rowCount} row${rowCount !== 1 ? 's' : ''}` :
		''
	);
</script>

<!--
	Three-panel layout filling full remaining viewport.
	top offset: topbar 3.5rem + tab bar 3rem = 6.5rem.
	The project layout wraps us in <div class="pt-12">, which is inside
	<main class="ml-16 mt-14">, so we use negative margin to escape the pt-12
	and fill height ourselves.
-->
<div
	class="flex overflow-hidden -mt-12"
	style="height: calc(100vh - 6.5rem);"
>
	<!-- ── LEFT PANEL: tables + history ──────────────────────────────────── -->
	<aside class="w-[260px] shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-hidden">
		<!-- tables section -->
		<div class="shrink-0 px-4 pt-4 pb-2">
			<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)]">
				tables
			</p>
		</div>

		<div class="flex-none overflow-y-auto max-h-[40%]">
			{#if data.tables.length === 0}
				<p class="px-4 py-2 text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">
					no tables yet
				</p>
			{:else}
				{#each data.tables as table, i (table.id)}
					<button
						type="button"
						onclick={() => loadSQL(`SELECT * FROM ${table.name} LIMIT 50;`)}
						class="
							flex items-center gap-2 w-full px-4 py-2 text-left text-xs
							text-[var(--color-muted)] hover:text-[var(--color-text)]
							hover:bg-white/5 transition-colors font-[var(--font-body)]
							animate-fade-up
						"
						style="animation-delay: {i * 30}ms"
					>
						<Table size={11} class="shrink-0 text-[var(--color-accent)]" />
						{table.name}
					</button>
				{/each}
			{/if}
		</div>

		<!-- divider + history section -->
		<div class="shrink-0 border-t border-[var(--color-border)] px-4 pt-3 pb-2 mt-1">
			<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)]">
				history
			</p>
		</div>

		<div class="flex-1 overflow-y-auto">
			{#if localHistory.length === 0}
				<p class="px-4 py-2 text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">
					no queries yet
				</p>
			{:else}
				{#each localHistory as item, i (item.id)}
					<button
						type="button"
						onclick={() => loadSQL(item.sql)}
						class="
							flex flex-col gap-0.5 w-full px-4 py-2 text-left
							hover:bg-white/5 transition-colors border-b border-[var(--color-border)]/40
							animate-fade-up group/hist
						"
						style="animation-delay: {i * 20}ms"
					>
						<span class="text-xs text-[var(--color-text)] font-[var(--font-body)] truncate group-hover/hist:text-[var(--color-accent)] transition-colors">
							{item.sql.slice(0, 60)}{item.sql.length > 60 ? '…' : ''}
						</span>
						<span class="text-[10px] text-[var(--color-muted)] font-[var(--font-ui)]">
							{relativeTime(item.ran_at)}
						</span>
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- ── CENTER PANEL: editor + toolbar + results ───────────────────────── -->
	<div class="flex-1 flex flex-col min-w-0 overflow-hidden">

		<!-- Monaco editor (~55% of panel height) -->
		<div class="shrink-0" style="height: 55%;">
			<div bind:this={editorContainer} class="w-full h-full"></div>
		</div>

		<!-- toolbar bar (40px) -->
		<div
			class="
				shrink-0 h-10 flex items-center gap-2 px-3
				border-t border-b border-[var(--color-border)]
				bg-[color-mix(in_srgb,var(--color-surface-1)_80%,transparent)]
			"
		>
			<!-- left: run + save -->
			<Button variant="primary" size="sm" onclick={runQuery} disabled={status === 'running'}>
				{#snippet icon()}<Play size={12} />{/snippet}
				{#snippet children()}{status === 'running' ? 'running...' : 'run'}{/snippet}
			</Button>

			<Button variant="ghost" size="sm" onclick={saveQuery} disabled={saving}>
				{#snippet icon()}<Save size={12} />{/snippet}
				{#snippet children()}save{/snippet}
			</Button>

			<!-- center: status -->
			<div class="flex-1 flex justify-center">
				{#if status === 'error'}
					<span class="text-xs text-[var(--color-danger)] font-[var(--font-body)] truncate max-w-sm">
						{errorMsg}
					</span>
				{:else if statusText}
					<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
						{statusText}
					</span>
				{/if}
			</div>

			<!-- right: clear + schema toggle -->
			{#if results !== null || status === 'error'}
				<button
					type="button"
					onclick={clearResults}
					class="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors font-[var(--font-ui)] px-1.5 py-1"
				>
					<X size={11} />
					clear
				</button>
			{/if}

			<button
				type="button"
				onclick={() => (showSchema = !showSchema)}
				class="flex items-center gap-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors font-[var(--font-ui)] px-1.5 py-1 ml-1"
				title={showSchema ? 'hide schema reference' : 'show schema reference'}
			>
				{#if showSchema}
					<ChevronRight size={13} />
				{:else}
					<ChevronLeft size={13} />
				{/if}
			</button>
		</div>

		<!-- results panel (remaining height) -->
		<div class="flex-1 overflow-auto bg-[var(--color-bg)]">
			{#if status === 'error'}
				<div class="m-4 p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
					<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)] whitespace-pre-wrap">{errorMsg}</p>
				</div>
			{:else if results === null}
				<div class="flex items-center justify-center h-full">
					<EmptyState title="no results yet" description="run a query to see results">
						{#snippet icon()}<Table size={32} strokeWidth={1.25} />{/snippet}
					</EmptyState>
				</div>
			{:else if results.length === 0}
				<div class="flex items-center justify-center h-full">
					<EmptyState title="query returned no rows" description="the query succeeded but returned 0 rows">
						{#snippet icon()}<Table size={32} strokeWidth={1.25} />{/snippet}
					</EmptyState>
				</div>
			{:else}
				<table class="w-full text-xs font-[var(--font-body)] border-collapse">
					<thead>
						<tr>
							{#each columns as col}
								<th
									class="
										sticky top-0 px-3 py-2 text-left
										bg-[var(--color-surface-2)]
										text-[var(--color-muted)] uppercase tracking-wide text-[10px]
										border-b border-[var(--color-border)]
										whitespace-nowrap
									"
								>
									{col}
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each results as row, i}
							<tr class={i % 2 === 0 ? '' : 'bg-white/[0.02]'}>
								{#each columns as col}
									<td class="px-3 py-2 border-b border-[var(--color-border)]/50 text-[var(--color-text)] whitespace-nowrap max-w-[300px] truncate">
										{#if row[col] === null || row[col] === undefined}
											<span class="text-[var(--color-muted)] italic">null</span>
										{:else if typeof row[col] === 'object'}
											{JSON.stringify(row[col])}
										{:else}
											{row[col]}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	</div>

	<!-- ── RIGHT PANEL: schema reference (collapsible) ───────────────────── -->
	{#if showSchema}
		<aside
			class="
				w-[240px] shrink-0 flex flex-col
				border-l border-[var(--color-border)]
				bg-[var(--color-surface-1)] overflow-hidden
			"
		>
			<div class="shrink-0 px-4 pt-4 pb-2 border-b border-[var(--color-border)]">
				<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)]">
					schema reference
				</p>
			</div>

			<div class="flex-1 overflow-y-auto py-1">
				{#if data.tables.length === 0}
					<p class="px-4 py-3 text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">
						no tables in schema
					</p>
				{:else}
					{#each data.tables as table (table.id)}
						{@const isOpen = expanded[table.id] ?? false}
						<div class="border-b border-[var(--color-border)]/40">
							<button
								type="button"
								onclick={() => (expanded[table.id] = !isOpen)}
								class="
									flex items-center gap-2 w-full px-4 py-2.5 text-left
									hover:bg-white/5 transition-colors
								"
							>
								<span class="text-[10px] text-[var(--color-muted)] transition-transform duration-150 {isOpen ? 'rotate-90' : ''}">
									▶
								</span>
								<span class="text-xs font-bold text-[var(--color-text)] font-[var(--font-display)]">
									{table.name}
								</span>
							</button>

							{#if isOpen}
								<div class="pb-1 px-4">
									{#each (table as any).fields ?? [] as field (field.id)}
										<div class="flex items-center gap-2 py-1">
											<span class="text-xs text-[var(--color-text)] font-[var(--font-body)] flex-1 truncate">
												{field.name}
											</span>
											<span class="text-[10px] text-[var(--color-muted)] font-[var(--font-body)] shrink-0">
												{field.type}
											</span>
										</div>
									{:else}
										<p class="text-xs text-[var(--color-muted)] italic font-[var(--font-ui)]">no fields</p>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</aside>
	{/if}
</div>
