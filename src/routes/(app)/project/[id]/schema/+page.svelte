<script lang="ts">
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { ZoomIn, ZoomOut, Maximize2, Plus, GitBranch, Download } from 'lucide-svelte';
	import TableCard from '$components/schema/TableCard.svelte';
	import FieldEditor from '$components/schema/FieldEditor.svelte';
	import RelationshipLayer from '$components/schema/RelationshipLayer.svelte';
	import RelationshipTypePopover from '$components/schema/RelationshipTypePopover.svelte';
	import SQLExportModal from '$components/schema/SQLExportModal.svelte';
	import Button from '$components/ui/Button.svelte';
	import { showToast } from '$lib/stores/toasts';
	import type { SchemaTable, SchemaField } from '$components/schema/TableCard.svelte';

	interface Relationship {
		id:            string;
		from_table_id: string;
		from_field_id: string;
		to_table_id:   string;
		to_field_id:   string;
		relation_type: string;
	}

	let { data }: { data: PageData } = $props();

	// ── local table state (synced from server, then mutated locally) ──────────
	let tables = $state<SchemaTable[]>([]);

	$effect(() => {
		tables = (data.tables ?? []).map((t: any) => ({
			...t,
			fields: [...(t.fields ?? [])].sort((a: SchemaField, b: SchemaField) => a.position - b.position),
		}));
	});

	// ── relationship state ────────────────────────────────────────────────────
	let relationships = $state<Relationship[]>([]);

	$effect(() => {
		relationships = data.relationships ?? [];
	});

	// ── canvas pan + zoom ─────────────────────────────────────────────────────
	let panX   = $state(0);
	let panY   = $state(0);
	let zoom   = $state(1);

	let canvasEl: HTMLDivElement | undefined = $state();

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta   = e.deltaY > 0 ? 0.9 : 1.1;
		const newZoom = Math.min(2.0, Math.max(0.4, zoom * delta));

		if (!canvasEl) { zoom = newZoom; return; }

		// zoom centered on the cursor position
		const rect   = canvasEl.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		panX = mouseX - (mouseX - panX) * (newZoom / zoom);
		panY = mouseY - (mouseY - panY) * (newZoom / zoom);
		zoom = newZoom;
	}

	// ── canvas panning (drag on background) ──────────────────────────────────
	let isPanning  = $state(false);
	let panAnchor  = $state({ x: 0, y: 0, px: 0, py: 0 });

	function handleCanvasMouseDown(e: MouseEvent) {
		// only pan when clicking the canvas background, not a table node
		if ((e.target as Element).closest('[data-table-node]')) return;
		if (isDraggingTable) return;
		e.preventDefault();
		isPanning = true;
		panAnchor = { x: e.clientX, y: e.clientY, px: panX, py: panY };
	}

	// ── table dragging ────────────────────────────────────────────────────────
	let isDraggingTable = $state(false);
	let dragState: {
		tableId:      string;
		startTableX:  number;
		startTableY:  number;
		startMouseX:  number;
		startMouseY:  number;
	} | null = $state(null);

	function startTableDrag(e: MouseEvent, table: SchemaTable) {
		if (drawMode) return; // don't drag in draw mode
		e.preventDefault();
		isDraggingTable = true;
		dragState = {
			tableId:     table.id,
			startTableX: table.x,
			startTableY: table.y,
			startMouseX: e.clientX,
			startMouseY: e.clientY,
		};
		selectedTableId = table.id;
	}

	// ── unified window mouse handlers ─────────────────────────────────────────
	function handleMouseMove(e: MouseEvent) {
		if (isPanning) {
			panX = panAnchor.px + (e.clientX - panAnchor.x);
			panY = panAnchor.py + (e.clientY - panAnchor.y);
		}

		if (isDraggingTable && dragState) {
			// convert screen delta to canvas-space delta (account for zoom)
			const dx = (e.clientX - dragState.startMouseX) / zoom;
			const dy = (e.clientY - dragState.startMouseY) / zoom;

			tables = tables.map((t) =>
				t.id === dragState!.tableId
					? { ...t, x: dragState!.startTableX + dx, y: dragState!.startTableY + dy }
					: t
			);
		}
	}

	function handleMouseUp() {
		if (isDraggingTable && dragState) {
			const moved = tables.find((t) => t.id === dragState!.tableId);
			if (moved) {
				// fire-and-forget position persist
				fetch('?/saveTablePosition', {
					method:  'POST',
					headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
					body:    new URLSearchParams({ id: moved.id, x: String(Math.round(moved.x)), y: String(Math.round(moved.y)) }),
				});
			}
		}
		isPanning       = false;
		isDraggingTable = false;
		dragState       = null;
	}

	// ── selection + field editor ──────────────────────────────────────────────
	let selectedTableId: string | null = $state(null);

	let selectedTable = $derived(tables.find((t) => t.id === selectedTableId) ?? null);

	function handleCanvasClick(e: MouseEvent) {
		// close context menu if open
		if (ctxMenu) { ctxMenu = null; return; }
		// deselect when clicking the canvas background
		if (!(e.target as Element).closest('[data-table-node]')) {
			selectedTableId = null;
		}
	}

	function handleFieldSave(tableId: string, fields: SchemaField[]) {
		tables = tables.map((t) => t.id === tableId ? { ...t, fields } : t);
	}

	function handleDeleteTable(tableId: string) {
		fetch('?/deleteTable', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body:    new URLSearchParams({ id: tableId }),
		}).then(async (res) => {
			const result = deserialize(await res.text());
			if (result.type === 'success') {
				tables = tables.filter((t) => t.id !== tableId);
				// also remove any relationships involving this table
				relationships = relationships.filter(
					(r) => r.from_table_id !== tableId && r.to_table_id !== tableId
				);
				if (selectedTableId === tableId) selectedTableId = null;
				showToast('table deleted', 'success');
			} else {
				showToast('failed to delete table', 'error');
			}
		});
	}

	// ── toolbar actions ───────────────────────────────────────────────────────
	let creating = $state(false);

	async function handleCreateTable() {
		creating = true;
		const res    = await fetch('?/createTable', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body:    new URLSearchParams({ count: String(tables.length) }),
		});
		const result = deserialize(await res.text());
		creating = false;

		if (result.type === 'success' && result.data?.table) {
			const newTable = result.data.table as any;
			tables = [...tables, { ...newTable, fields: [] }];
		} else {
			showToast('failed to create table', 'error');
		}
	}

	function fitView() {
		panX = 0;
		panY = 0;
		zoom = 1;
	}

	let zoomPercent = $derived(Math.round(zoom * 100));

	// ── draw mode (relationship drawing) ─────────────────────────────────────
	let drawMode     = $state(false);
	let pendingFrom: { tableId: string; fieldId: string } | null = $state(null);

	// ── dot grid background tracks pan ───────────────────────────────────────
	let dotBgPos  = $derived(`${panX % 24}px ${panY % 24}px`);
	let cursorStyle = $derived(
		drawMode        ? 'crosshair' :
		isPanning || isDraggingTable ? 'grabbing' : 'default'
	);
	const DOT_GRID = "url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2724%27 height=%2724%27%3E%3Ccircle cx=%271%27 cy=%271%27 r=%271%27 fill=%27%23ffffff08%27/%3E%3C/svg%3E')";

	function toggleDrawMode() {
		drawMode    = !drawMode;
		pendingFrom = null;
	}

	// ── relationship type popover ─────────────────────────────────────────────
	let showRelTypePopover = $state(false);
	let pendingRel: { from_table_id: string; from_field_id: string; to_table_id: string; to_field_id: string } | null = $state(null);

	function handleFieldClick(payload: { tableId: string; fieldId: string }) {
		if (!drawMode) return;

		if (!pendingFrom) {
			// first click — record source
			pendingFrom = { tableId: payload.tableId, fieldId: payload.fieldId };
			showToast('now click the target field', 'success');
			return;
		}

		// prevent self-loop
		if (pendingFrom.fieldId === payload.fieldId) {
			showToast('pick a different field', 'error');
			return;
		}

		pendingRel = {
			from_table_id: pendingFrom.tableId,
			from_field_id: pendingFrom.fieldId,
			to_table_id:   payload.tableId,
			to_field_id:   payload.fieldId,
		};
		pendingFrom        = null;
		showRelTypePopover = true;
	}

	async function confirmRelationship(type: string) {
		showRelTypePopover = false;
		if (!pendingRel) return;

		const body = new URLSearchParams({
			from_table_id: pendingRel.from_table_id,
			from_field_id: pendingRel.from_field_id,
			to_table_id:   pendingRel.to_table_id,
			to_field_id:   pendingRel.to_field_id,
			relation_type: type,
		});

		const res    = await fetch('?/createRelationship', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		});
		const result = deserialize(await res.text());

		if (result.type === 'success' && result.data?.relationship) {
			relationships = [...relationships, result.data.relationship as Relationship];
			showToast('relationship created', 'success');
		} else {
			showToast('failed to create relationship', 'error');
		}
		pendingRel = null;
	}

	function cancelRelationship() {
		showRelTypePopover = false;
		pendingRel         = null;
		pendingFrom        = null;
	}

	// ── relationship right-click context menu ─────────────────────────────────
	interface CtxMenu { x: number; y: number; relId: string }
	let ctxMenu = $state<CtxMenu | null>(null);

	function handleRelRightClick(e: MouseEvent, relId: string) {
		e.preventDefault();
		ctxMenu = { x: e.clientX, y: e.clientY, relId };
	}

	async function deleteRelationship(relId: string) {
		ctxMenu = null;
		const res    = await fetch('?/deleteRelationship', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body:    new URLSearchParams({ id: relId }),
		});
		const result = deserialize(await res.text());
		if (result.type === 'success') {
			relationships = relationships.filter((r) => r.id !== relId);
			showToast('relationship deleted', 'success');
		} else {
			showToast('failed to delete relationship', 'error');
		}
	}

	// ── SQL export modal ──────────────────────────────────────────────────────
	let showSQL = $state(false);

	// ── global escape key ─────────────────────────────────────────────────────
	function handleWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (ctxMenu)           { ctxMenu = null; return; }
			if (showRelTypePopover) { cancelRelationship(); return; }
			if (drawMode)          { drawMode = false; pendingFrom = null; return; }
			if (showSQL)           { showSQL = false; return; }
		}
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} onkeydown={handleWindowKeydown} />

<!-- canvas fills remaining viewport below topbar + tab bar -->
<div
	bind:this={canvasEl}
	class="relative w-full overflow-hidden select-none"
	style="height:calc(100vh - 6.5rem);background-color:var(--color-bg);background-image:{DOT_GRID};background-size:24px 24px;background-position:{dotBgPos};cursor:{cursorStyle};"
	onmousedown={handleCanvasMouseDown}
	onclick={handleCanvasClick}
	onwheel={handleWheel}
	role="presentation"
>
	<!-- canvas layer: all table nodes + relationship SVG live here, transformed for pan+zoom -->
	<div
		style="
			position: absolute;
			inset: 0;
			transform: translate({panX}px, {panY}px) scale({zoom});
			transform-origin: 0 0;
		"
	>
		<!-- relationship SVG (rendered below table cards) -->
		<RelationshipLayer
			{tables}
			{relationships}
			onrightclick={handleRelRightClick}
		/>

		{#each tables as table (table.id)}
			<TableCard
				{table}
				selected={selectedTableId === table.id}
				onheadermousedown={(e) => startTableDrag(e, table)}
				onselect={() => { if (!drawMode) selectedTableId = table.id; }}
				onaddfield={() => (selectedTableId = table.id)}
				{drawMode}
				highlightFieldId={pendingFrom?.tableId === table.id ? pendingFrom.fieldId : null}
				onfieldclick={handleFieldClick}
			/>
		{/each}
	</div>

	<!-- floating toolbar (not inside the transformed layer) -->
	<div class="absolute top-3 left-3 z-10 flex items-center gap-2">
		<Button
			variant="primary"
			size="sm"
			disabled={creating}
			onclick={handleCreateTable}
		>
			{#snippet icon()}<Plus size={13} />{/snippet}
			{#snippet children()}{creating ? 'adding...' : 'add table'}{/snippet}
		</Button>

		<!-- draw relationship mode toggle -->
		<Button
			variant={drawMode ? 'primary' : 'ghost'}
			size="sm"
			onclick={toggleDrawMode}
		>
			{#snippet icon()}<GitBranch size={13} />{/snippet}
			{#snippet children()}{drawMode ? (pendingFrom ? 'pick target...' : 'drawing') : 'add relation'}{/snippet}
		</Button>

		<!-- SQL export -->
		<Button variant="ghost" size="sm" onclick={() => (showSQL = true)}>
			{#snippet icon()}<Download size={13} />{/snippet}
			{#snippet children()}export SQL{/snippet}
		</Button>

		<Button variant="ghost" size="sm" onclick={fitView}>
			{#snippet icon()}<Maximize2 size={13} />{/snippet}
			{#snippet children()}fit view{/snippet}
		</Button>

		<!-- zoom controls + indicator -->
		<div class="flex items-center gap-1 glass rounded-lg px-2 py-1 border border-[var(--color-border)]">
			<button
				onclick={() => { zoom = Math.max(0.4, zoom - 0.1); }}
				class="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-0.5"
				aria-label="Zoom out"
			>
				<ZoomOut size={12} />
			</button>
			<span class="text-xs text-[var(--color-muted)] font-[var(--font-body)] w-10 text-center tabular-nums">
				{zoomPercent}%
			</span>
			<button
				onclick={() => { zoom = Math.min(2.0, zoom + 0.1); }}
				class="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-0.5"
				aria-label="Zoom in"
			>
				<ZoomIn size={12} />
			</button>
		</div>
	</div>

	<!-- draw mode banner -->
	{#if drawMode}
		<div class="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
			<div class="glass border border-[var(--color-accent)] rounded-lg px-3 py-1.5">
				<p class="text-xs text-[var(--color-accent)] font-[var(--font-ui)]">
					{pendingFrom ? 'click the target field to complete the relationship' : 'click a field to start drawing a relationship — esc to cancel'}
				</p>
			</div>
		</div>
	{/if}

	<!-- empty canvas hint -->
	{#if tables.length === 0 && !creating}
		<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
			<div class="text-center animate-fade-up">
				<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)]">
					click <span class="text-[var(--color-text)]">+ add table</span> to start building your schema
				</p>
			</div>
		</div>
	{/if}

	<!-- relationship right-click context menu -->
	{#if ctxMenu}
		<div
			class="fixed z-50 glass border border-[var(--color-border)] rounded-lg py-1 shadow-xl min-w-[140px]"
			style="left: {ctxMenu.x}px; top: {ctxMenu.y}px;"
			role="menu"
		>
			<button
				type="button"
				role="menuitem"
				onclick={() => deleteRelationship(ctxMenu!.relId)}
				class="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-glow)] transition-colors font-[var(--font-ui)]"
			>
				delete relationship
			</button>
		</div>
	{/if}
</div>

<!-- field editor panel (slides in from right when a table is selected) -->
{#if !drawMode}
	<FieldEditor
		table={selectedTable}
		onclose={() => (selectedTableId = null)}
		ondelete={handleDeleteTable}
		onsave={handleFieldSave}
	/>
{/if}

<!-- relationship type popover -->
<RelationshipTypePopover
	open={showRelTypePopover}
	onconfirm={confirmRelationship}
	oncancel={cancelRelationship}
/>

<!-- SQL export modal -->
<SQLExportModal
	open={showSQL}
	{tables}
	{relationships}
	onclose={() => (showSQL = false)}
/>
