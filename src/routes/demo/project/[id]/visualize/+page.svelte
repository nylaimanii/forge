<script lang="ts">
	import { page } from '$app/state';
	import { demoData } from '$lib/stores/demo';
	import { showToast } from '$lib/stores/toasts';
	import TableView from '$components/visualize/TableView.svelte';
	import CardView from '$components/visualize/CardView.svelte';
	import { TableProperties, CreditCard } from 'lucide-svelte';

	type ViewType = 'table' | 'card';
	let viewType = $state<ViewType>('table');

	let projectId = $derived(page.params.id);
	let selectedTableName = $state('');
	let tables = $derived($demoData.tables.filter(t => t.projectId === projectId));
	let rows = $derived(($demoData.rowsByProject[projectId ?? ''] ?? []) as Record<string, unknown>[]);
	let columns = $derived(rows.length > 0 ? Object.keys(rows[0]) : []);

	$effect(() => {
		if (tables.length > 0 && !tables.find(t => t.name === selectedTableName)) {
			selectedTableName = tables[0].name;
		}
	});

	function warnSave() {
		showToast('sign up to save your visualization config', 'info');
	}
</script>

<div class="flex flex-col overflow-hidden -mt-12" style="height: calc(100vh - 6rem);">
	<!-- toolbar -->
	<div class="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-[var(--color-border)]">
		<!-- table selector -->
		<select
			bind:value={selectedTableName}
			class="h-8 px-3 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)]
				text-xs text-[var(--color-text)] font-[var(--font-ui)]
				focus:outline-none focus:border-[var(--color-electric)]"
		>
			{#each tables as t}
				<option value={t.name}>{t.name}</option>
			{/each}
		</select>

		<!-- view toggle -->
		<div class="flex items-center gap-1 glass rounded-lg p-1 border border-[var(--color-border)]">
			<button
				onclick={() => (viewType = 'table')}
				class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-[var(--font-ui)] transition-all
					{viewType === 'table' ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
			>
				<TableProperties size={11} />
				Table
			</button>
			<button
				onclick={() => (viewType = 'card')}
				class="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-[var(--font-ui)] transition-all
					{viewType === 'card' ? 'bg-[var(--color-surface-3)] text-[var(--color-text)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
			>
				<CreditCard size={11} />
				Cards
			</button>
		</div>

		<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">{rows.length} rows · demo data</span>
	</div>

	<!-- content -->
	<div class="flex-1 overflow-auto">
		{#if viewType === 'table'}
			<TableView {rows} {columns} />
		{:else}
			<CardView
				{rows}
				{columns}
				tableConfig={null}
				tableName={selectedTableName}
				onSaveConfig={warnSave}
			/>
		{/if}
	</div>
</div>
