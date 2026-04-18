<script lang="ts">
	import { Key } from 'lucide-svelte';
	import Badge from '$components/ui/Badge.svelte';

	export interface SchemaField {
		id:          string;
		name:        string;
		type:        string;
		is_primary:  boolean;
		is_nullable: boolean;
		position:    number;
	}

	export interface SchemaTable {
		id:     string;
		name:   string;
		x:      number;
		y:      number;
		fields: SchemaField[];
	}

	interface Props {
		table:              SchemaTable;
		selected:           boolean;
		onheadermousedown:  (e: MouseEvent) => void;
		onselect:           () => void;
		onaddfield:         () => void;
		drawMode?:          boolean;
		highlightFieldId?:  string | null;
		onfieldclick?:      (payload: { tableId: string; fieldId: string }) => void;
	}

	let { table, selected, onheadermousedown, onselect, onaddfield, drawMode = false, highlightFieldId = null, onfieldclick }: Props = $props();

	// pick a deterministic accent color from the table name
	const PALETTE = ['#6c63ff', '#00f5d4', '#ff4d6d', '#ffb84d', '#7dd87d', '#b784ff'];

	function tableColor(name: string): string {
		let h = 0;
		for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
		return PALETTE[h % PALETTE.length];
	}

	let dotColor = $derived(tableColor(table.name));
	let sortedFields = $derived([...table.fields].sort((a, b) => a.position - b.position));
</script>

<!-- absolutely positioned inside the canvas layer -->
<div
	data-table-node
	role="button"
	tabindex="0"
	onclick={onselect}
	onkeydown={(e) => { if (e.key === 'Enter') onselect(); }}
	class="
		absolute w-[220px] rounded-xl overflow-hidden cursor-default select-none
		bg-[var(--color-surface-1)] border backdrop-blur-md
		transition-all duration-150
		{selected
			? 'border-[var(--color-accent)] shadow-[0_0_24px_var(--color-accent-glow)]'
			: 'border-[var(--color-border)] hover:border-white/20 shadow-lg shadow-black/40'
		}
	"
	style="left: {table.x}px; top: {table.y}px;"
>
	<!-- draggable header -->
	<div
		role="button"
		tabindex="-1"
		class="
			flex items-center gap-2 px-3 py-2.5 cursor-grab active:cursor-grabbing
			border-b border-[var(--color-border)]
			bg-[color-mix(in_srgb,var(--color-surface-2)_60%,transparent)]
		"
		onmousedown={(e) => { e.stopPropagation(); onheadermousedown(e); }}
	>
		<!-- color dot derived from table name -->
		<span
			class="w-2 h-2 rounded-full shrink-0"
			style="background: {dotColor}; box-shadow: 0 0 6px {dotColor}80"
		></span>
		<span class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)] truncate flex-1">
			{table.name}
		</span>
	</div>

	<!-- field list -->
	<div class="py-1">
		{#each sortedFields as field (field.id)}
			<div
				class="
					flex items-center gap-2 px-3 py-1.5 group/field transition-colors
					{drawMode ? 'cursor-pointer' : ''}
					{drawMode && highlightFieldId === field.id ? 'bg-[var(--color-accent-glow)]' : ''}
					{drawMode && highlightFieldId !== field.id ? 'hover:bg-white/5' : ''}
				"
				role={drawMode ? 'button' : undefined}
				tabindex={drawMode ? 0 : undefined}
				onclick={drawMode
					? (e) => { e.stopPropagation(); onfieldclick?.({ tableId: table.id, fieldId: field.id }); }
					: undefined}
				onkeydown={drawMode
					? (e) => { if (e.key === 'Enter') onfieldclick?.({ tableId: table.id, fieldId: field.id }); }
					: undefined}
			>
				<!-- primary key icon -->
				{#if field.is_primary}
					<Key size={10} class="text-[var(--color-accent)] shrink-0" />
				{:else}
					<span class="w-[10px] shrink-0"></span>
				{/if}

				<!-- field name + nullable marker -->
				<span class="text-xs text-[var(--color-text)] font-[var(--font-body)] flex-1 truncate">
					{field.name}{field.is_nullable && !field.is_primary ? '?' : ''}
				</span>

				<!-- type badge -->
				<Badge color="muted">
					{#snippet children()}{field.type}{/snippet}
				</Badge>
			</div>
		{:else}
			<p class="px-3 py-2 text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">
				no fields yet
			</p>
		{/each}
	</div>

	<!-- add field footer -->
	<div class="border-t border-[var(--color-border)] px-3 py-2">
		<button
			type="button"
			onclick={(e) => { e.stopPropagation(); onaddfield(); }}
			class="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors font-[var(--font-ui)] w-full text-left"
		>
			+ add field
		</button>
	</div>
</div>
