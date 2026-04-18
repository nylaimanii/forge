<script lang="ts">
	import type { SchemaTable } from './TableCard.svelte';

	interface Relationship {
		id:            string;
		from_table_id: string;
		from_field_id: string;
		to_table_id:   string;
		to_field_id:   string;
		relation_type: string;
	}

	interface Props {
		tables:        SchemaTable[];
		relationships: Relationship[];
		onrightclick:  (e: MouseEvent, relId: string) => void;
	}

	let { tables, relationships, onrightclick }: Props = $props();

	// ── coordinate helpers ────────────────────────────────────────────────────
	const TABLE_WIDTH    = 220;
	const HEADER_HEIGHT  = 42;  // px for the table header
	const FIELD_HEIGHT   = 36;  // px per field row
	const FIELD_PAD      = 4;   // py-1 top padding

	function getFieldCenter(table: SchemaTable, fieldId: string, side: 'left' | 'right') {
		const sorted = [...table.fields].sort((a, b) => a.position - b.position);
		const idx    = sorted.findIndex((f) => f.id === fieldId);
		if (idx === -1) return null;

		const y = table.y + HEADER_HEIGHT + FIELD_PAD + idx * FIELD_HEIGHT + FIELD_HEIGHT / 2;
		const x = side === 'right' ? table.x + TABLE_WIDTH : table.x;
		return { x, y };
	}

	interface PathData {
		id:           string;
		d:            string;
		midX:         number;
		midY:         number;
		relation_type: string;
		toX:          number;
		toY:          number;
	}

	let paths = $derived<PathData[]>(
		relationships.flatMap((rel) => {
			const fromTable = tables.find((t) => t.id === rel.from_table_id);
			const toTable   = tables.find((t) => t.id === rel.to_table_id);
			if (!fromTable || !toTable) return [];

			// pick which side of each table to connect from (whichever is closer)
			const fromCenterX = fromTable.x + TABLE_WIDTH / 2;
			const toCenterX   = toTable.x   + TABLE_WIDTH / 2;
			const fromSide    = fromCenterX < toCenterX ? 'right' : 'left';
			const toSide      = fromSide === 'right' ? 'left' : 'right';

			const from = getFieldCenter(fromTable, rel.from_field_id, fromSide);
			const to   = getFieldCenter(toTable,   rel.to_field_id,   toSide);
			if (!from || !to) return [];

			// cubic bezier — control points pulled horizontally by ~120px
			const dx = Math.abs(to.x - from.x);
			const cp = Math.max(60, dx * 0.5);
			const c1x = fromSide === 'right' ? from.x + cp : from.x - cp;
			const c2x = toSide   === 'right' ? to.x   + cp : to.x   - cp;

			const d = `M ${from.x} ${from.y} C ${c1x} ${from.y} ${c2x} ${to.y} ${to.x} ${to.y}`;

			const midX = (from.x + to.x) / 2;
			const midY = (from.y + to.y) / 2;

			return [{ id: rel.id, d, midX, midY, relation_type: rel.relation_type, toX: to.x, toY: to.y }];
		})
	);
</script>

<!--
	SVG layer — fills the same infinite canvas space.
	pointer-events: none on the SVG itself so clicks fall through to table nodes;
	pointer-events: stroke on path elements so only the line itself is clickable.
-->
<svg
	class="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
	aria-hidden="true"
>
	{#each paths as p (p.id)}
		<!-- invisible wider hit path for easier right-click -->
		<path
			d={p.d}
			fill="none"
			stroke="transparent"
			stroke-width="16"
			style="pointer-events: stroke; cursor: context-menu;"
			oncontextmenu={(e) => { e.preventDefault(); onrightclick(e, p.id); }}
		/>

		<!-- visible bezier line -->
		<path
			d={p.d}
			fill="none"
			stroke="var(--color-accent)"
			stroke-width="1.5"
			stroke-dasharray="5 3"
			opacity="0.7"
			style="pointer-events: none;"
		/>

		<!-- circle at "to" end -->
		<circle
			cx={p.toX}
			cy={p.toY}
			r="4"
			fill="var(--color-accent)"
			opacity="0.9"
			style="pointer-events: none;"
		/>

		<!-- relation type label at midpoint -->
		<text
			x={p.midX}
			y={p.midY - 6}
			text-anchor="middle"
			dominant-baseline="auto"
			font-size="9"
			font-family="var(--font-ui, monospace)"
			fill="var(--color-muted)"
			style="pointer-events: none; user-select: none;"
		>
			{p.relation_type}
		</text>
	{/each}
</svg>
