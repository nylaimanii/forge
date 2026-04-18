<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import {
		TableProperties, CreditCard, BarChart2, UserCircle, RefreshCw
	} from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import Badge from '$components/ui/Badge.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import Tooltip from '$components/ui/Tooltip.svelte';
	import TableView from '$components/visualize/TableView.svelte';
	import CardView from '$components/visualize/CardView.svelte';
	import type { CardConfig } from '$components/visualize/PokemonCard.svelte';
	import { showToast } from '$lib/stores/toasts';

	let { data }: { data: PageData } = $props();

	type ViewType = 'table' | 'card';

	let selectedTable: typeof data.tables[number] | null = $state(null);
	let viewType   = $state<ViewType>('table');
	let rows       = $state<any[]>([]);
	let columns    = $state<string[]>([]);
	let loading    = $state(false);
	let loadError  = $state('');

	// ── load data ─────────────────────────────────────────────────────────────
	async function loadData() {
		if (!selectedTable) return;
		loading   = true;
		loadError = '';
		rows      = [];
		columns   = [];

		const res = await fetch('/api/sql/run', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({
				sql:       `SELECT * FROM ${selectedTable.name} LIMIT 100`,
				projectId: $page.params.id,
			}),
		});

		const payload = await res.json();
		loading = false;

		if (!res.ok || payload.error) {
			loadError = payload.error ?? 'failed to load data';
			showToast(loadError, 'error');
			return;
		}

		rows    = payload.rows ?? [];
		columns = rows.length > 0 ? Object.keys(rows[0]) : [];
	}

	// when table selection changes, clear previous data
	$effect(() => {
		void selectedTable;
		rows    = [];
		columns = [];
		loadError = '';
	});

	// ── card config ────────────────────────────────────────────────────────────
	let cardConfigs = $state<typeof data.cardConfigs>([...data.cardConfigs]);

	function getCardConfig(tableName: string) {
		const found = cardConfigs.find((c) => c.table_name === tableName);
		if (!found) return null;
		const cfg = typeof found.config === 'string' ? JSON.parse(found.config) : found.config;
		return { config: cfg as CardConfig };
	}

	async function handleSaveCardConfig(config: CardConfig) {
		if (!selectedTable) return;
		const tableName = selectedTable.name;

		// optimistic update
		const existing = cardConfigs.findIndex((c) => c.table_name === tableName);
		if (existing >= 0) {
			cardConfigs = cardConfigs.map((c) =>
				c.table_name === tableName ? { ...c, config } : c
			);
		} else {
			cardConfigs = [...cardConfigs, { id: crypto.randomUUID(), table_name: tableName, config }];
		}

		showToast('card config saved', 'success');

		// fire-and-forget persist
		fetch('?/saveCardConfig', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body:    new URLSearchParams({ table_name: tableName, config: JSON.stringify(config) }),
		});
	}

	// ── view type options ─────────────────────────────────────────────────────
	const VIEW_OPTIONS = [
		{ type: 'table' as ViewType, label: 'Table',   icon: TableProperties, disabled: false },
		{ type: 'card'  as ViewType, label: 'Card',    icon: CreditCard,      disabled: false },
		{ type: null,                label: 'Chart',   icon: BarChart2,       disabled: true  },
		{ type: null,                label: 'Avatar',  icon: UserCircle,      disabled: true  },
	] as const;
</script>

<!--
	Full remaining viewport — escape pt-12 from project layout with -mt-12.
-->
<div
	class="flex overflow-hidden -mt-12"
	style="height: calc(100vh - 6.5rem);"
>
	<!-- ── LEFT SIDEBAR ───────────────────────────────────────────────────── -->
	<aside class="w-[260px] shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-y-auto">

		<!-- header -->
		<div class="shrink-0 px-4 pt-5 pb-2">
			<h2 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)]">visualize</h2>
		</div>

		<!-- section: table -->
		<div class="px-4 pt-3 pb-1">
			<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] mb-2">table</p>
			{#if data.tables.length === 0}
				<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">no tables in schema</p>
			{:else}
				<div class="flex flex-col gap-0.5">
					{#each data.tables as table (table.id)}
						{@const active = selectedTable?.id === table.id}
						<button
							type="button"
							onclick={() => (selectedTable = table)}
							class="
								flex items-center justify-between w-full px-3 py-2 rounded-lg text-left
								text-xs font-[var(--font-body)] transition-all
								{active
									? 'border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-glow)] text-[var(--color-text)] pl-[10px]'
									: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
								}
							"
						>
							<span class="truncate">{table.name}</span>
							<Badge color="muted">
								{#snippet children()}{(table as any).fields?.length ?? 0}{/snippet}
							</Badge>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div class="mx-4 my-3 border-t border-[var(--color-border)]"></div>

		<!-- section: view type -->
		<div class="px-4 pb-2">
			<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] mb-2">view type</p>
			<div class="flex flex-col gap-1">
				{#each VIEW_OPTIONS as opt}
					{@const active = !opt.disabled && opt.type === viewType}
					{#if opt.disabled}
						<Tooltip label="coming soon" position="right">
							<button
								type="button"
								disabled
								class="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-[var(--font-ui)] text-[var(--color-muted)] opacity-40 cursor-not-allowed"
							>
								<opt.icon size={14} />
								{opt.label}
							</button>
						</Tooltip>
					{:else}
						<button
							type="button"
							onclick={() => opt.type && (viewType = opt.type)}
							class="
								flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs
								font-[var(--font-ui)] transition-all
								{active
									? 'bg-[var(--color-accent-glow)] text-[var(--color-accent)]'
									: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
								}
							"
						>
							<opt.icon size={14} />
							{opt.label}
						</button>
					{/if}
				{/each}
			</div>
		</div>

		<!-- section: data (only when table selected) -->
		{#if selectedTable}
			<div class="mx-4 my-3 border-t border-[var(--color-border)]"></div>
			<div class="px-4 pb-4 flex flex-col gap-2">
				<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)]">data</p>

				<Button variant="primary" size="sm" onclick={loadData} disabled={loading}>
					{#snippet icon()}
						<RefreshCw size={12} class={loading ? 'animate-spin' : ''} />
					{/snippet}
					{#snippet children()}{loading ? 'loading...' : 'load data'}{/snippet}
				</Button>

				{#if rows.length > 0}
					<div class="flex items-center gap-2">
						<Badge color="cyan">
							{#snippet children()}{rows.length} row{rows.length !== 1 ? 's' : ''}{/snippet}
						</Badge>
					</div>
				{/if}

				<p class="text-[10px] text-[var(--color-muted)] font-[var(--font-ui)]">loads up to 100 rows</p>

				{#if loadError}
					<p class="text-[10px] text-[var(--color-danger)] font-[var(--font-ui)]">{loadError}</p>
				{/if}
			</div>
		{/if}
	</aside>

	<!-- ── MAIN AREA ──────────────────────────────────────────────────────── -->
	<div class="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg)]">
		{#if !selectedTable}
			<div class="flex items-center justify-center h-full">
				<EmptyState title="select a table" description="choose a table from the left to visualize your data">
					{#snippet icon()}<TableProperties size={36} strokeWidth={1.25} />{/snippet}
				</EmptyState>
			</div>

		{:else if loading}
			<div class="flex items-center justify-center h-full">
				<div class="flex flex-col items-center gap-3">
					<RefreshCw size={32} strokeWidth={1.25} class="text-[var(--color-muted)] animate-spin" />
					<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)]">loading data...</p>
				</div>
			</div>

		{:else if rows.length === 0 && !loadError}
			<div class="flex items-center justify-center h-full">
				<EmptyState
					title="no data loaded"
					description="click 'load data' in the sidebar to fetch rows from {selectedTable.name}"
				>
					{#snippet icon()}<RefreshCw size={36} strokeWidth={1.25} />{/snippet}
				</EmptyState>
			</div>

		{:else if viewType === 'table'}
			<TableView {rows} {columns} />

		{:else if viewType === 'card'}
			<CardView
				{rows}
				{columns}
				tableConfig={getCardConfig(selectedTable.name)}
				tableName={selectedTable.name}
				onSaveConfig={handleSaveCardConfig}
			/>
		{/if}
	</div>
</div>
