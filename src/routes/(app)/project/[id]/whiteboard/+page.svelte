<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { showToast } from '$lib/stores/toasts';

	let { data }: { data: PageData } = $props();

	// ── canvas refs ────────────────────────────────────────────────────────────
	let canvasEl: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | null = null;

	// ── drawing state ──────────────────────────────────────────────────────────
	let drawing = $state(false);
	let color = $state('#00d9ff');
	let thickness = $state(4);
	let hasDrawn = $state(false);
	const colors = ['#00d9ff', '#f0f0ff', '#a78bfa', '#fb7185'];

	// ── tools ──────────────────────────────────────────────────────────────────
	type Tool = 'pen' | 'eraser' | 'text' | 'line';
	let tool = $state<Tool>('pen');

	const TOOLS: [Tool, string, string][] = [
		['pen',    '✏️', 'Pen'],
		['eraser', '⬜', 'Eraser'],
		['line',   '╱',  'Line'],
		['text',   'T',  'Text'],
	];

	// ── undo stack ─────────────────────────────────────────────────────────────
	const MAX_UNDO = 20;
	let undoStack: ImageData[] = [];

	function saveSnapshot() {
		if (!ctx || !canvasEl) return;
		undoStack.push(ctx.getImageData(0, 0, canvasEl.width, canvasEl.height));
		if (undoStack.length > MAX_UNDO) undoStack.shift();
	}

	function undo() {
		if (!ctx || !canvasEl || undoStack.length === 0) return;
		ctx.putImageData(undoStack.pop()!, 0, 0);
		markDirty();
	}

	// ── line tool ──────────────────────────────────────────────────────────────
	let lineStart: [number, number] | null = null;
	let lineSnapshot: ImageData | null = null;

	// ── text tool ─────────────────────────────────────────────────────────────
	let pendingText = $state('');

	// ── keyboard shortcuts ─────────────────────────────────────────────────────
	function handleKeyDown(e: KeyboardEvent) {
		if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
			e.preventDefault();
			undo();
		}
	}

	// ── download ───────────────────────────────────────────────────────────────
	function downloadCanvas() {
		if (!canvasEl) return;
		const link = document.createElement('a');
		link.download = 'whiteboard.png';
		link.href = canvasEl.toDataURL('image/png');
		link.click();
	}

	// ── resize / getPos ────────────────────────────────────────────────────────
	function resize() {
		if (!canvasEl) return;
		const dpr = window.devicePixelRatio || 1;
		const rect = canvasEl.getBoundingClientRect();
		const tmp = document.createElement('canvas');
		tmp.width = canvasEl.width;
		tmp.height = canvasEl.height;
		tmp.getContext('2d')?.drawImage(canvasEl, 0, 0);
		canvasEl.width = rect.width * dpr;
		canvasEl.height = rect.height * dpr;
		ctx = canvasEl.getContext('2d');
		if (ctx) {
			ctx.scale(dpr, dpr);
			ctx.drawImage(tmp, 0, 0, rect.width, rect.height);
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
		}
	}

	function getPos(e: PointerEvent): [number, number] {
		const rect = canvasEl!.getBoundingClientRect();
		return [e.clientX - rect.left, e.clientY - rect.top];
	}

	// ── pointer handlers ───────────────────────────────────────────────────────
	function onPointerDown(e: PointerEvent) {
		if (!ctx || !canvasEl) return;
		// ignore if clicking on a data card
		if ((e.target as HTMLElement).closest('[data-card]')) return;
		canvasEl.setPointerCapture(e.pointerId);
		const [x, y] = getPos(e);

		if (tool === 'text') {
			if (pendingText.trim()) {
				saveSnapshot();
				ctx.font = `${thickness * 4 + 8}px var(--font-display, sans-serif)`;
				ctx.fillStyle = color;
				ctx.fillText(pendingText, x, y);
				hasDrawn = true;
				markDirty();
			}
			return;
		}

		if (tool === 'line') {
			saveSnapshot();
			lineStart = [x, y];
			lineSnapshot = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
			return;
		}

		saveSnapshot();
		drawing = true;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.strokeStyle = tool === 'eraser' ? '#05050a' : color;
		ctx.lineWidth = tool === 'eraser' ? thickness * 5 : thickness;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}

	function onPointerMove(e: PointerEvent) {
		if (!ctx || !canvasEl) return;

		if (tool === 'line' && lineStart && lineSnapshot) {
			const [x, y] = getPos(e);
			ctx.putImageData(lineSnapshot, 0, 0);
			ctx.beginPath();
			ctx.moveTo(lineStart[0], lineStart[1]);
			ctx.lineTo(x, y);
			ctx.strokeStyle = color;
			ctx.lineWidth = thickness;
			ctx.lineCap = 'round';
			ctx.stroke();
			return;
		}

		if (!drawing) return;
		const [x, y] = getPos(e);
		ctx.lineTo(x, y);
		ctx.stroke();
		if (!hasDrawn) hasDrawn = true;
	}

	function onPointerUp(e: PointerEvent) {
		if (tool === 'line' && lineStart && lineSnapshot && ctx && canvasEl) {
			const [x, y] = getPos(e);
			ctx.putImageData(lineSnapshot, 0, 0);
			ctx.beginPath();
			ctx.moveTo(lineStart[0], lineStart[1]);
			ctx.lineTo(x, y);
			ctx.strokeStyle = color;
			ctx.lineWidth = thickness;
			ctx.lineCap = 'round';
			ctx.stroke();
			lineStart = null;
			lineSnapshot = null;
			hasDrawn = true;
			markDirty();
			return;
		}
		const wasDrawing = drawing;
		drawing = false;
		ctx?.beginPath();
		lineStart = null;
		if (wasDrawing) markDirty();
	}

	function clearCanvas() {
		if (!ctx || !canvasEl) return;
		saveSnapshot();
		const dpr = window.devicePixelRatio || 1;
		ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);
		hasDrawn = false;
		markDirty();
	}

	// ── autosave ───────────────────────────────────────────────────────────────
	type SaveState = 'saved' | 'unsaved' | 'saving';
	let saveState = $state<SaveState>('saved');
	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	function markDirty() {
		saveState = 'unsaved';
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(doSave, 2000);
	}

	async function doSave() {
		if (!canvasEl) return;
		saveState = 'saving';
		try {
			const dataUrl = canvasEl.toDataURL('image/png');
			const res = await fetch('?/saveWhiteboard', {
				method:  'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body:    new URLSearchParams({ canvas_json: dataUrl }),
			});
			if (!res.ok) {
				saveState = 'unsaved';
				showToast('couldn\'t save whiteboard — try again in a moment', 'error');
				return;
			}
			saveState = 'saved';
		} catch {
			saveState = 'unsaved';
			showToast('couldn\'t save whiteboard — try again in a moment', 'error');
		}
	}

	// ── lifecycle ──────────────────────────────────────────────────────────────
	onMount(() => {
		if (!canvasEl) return;
		ctx = canvasEl.getContext('2d');
		resize();
		window.addEventListener('resize', resize);
		window.addEventListener('keydown', handleKeyDown);

		// restore previously saved canvas (PNG dataURL) if present
		if (data.whiteboard?.canvas_json) {
			const img = new Image();
			img.onload = () => {
				if (!ctx || !canvasEl) return;
				const dpr = window.devicePixelRatio || 1;
				ctx.drawImage(img, 0, 0, canvasEl.width / dpr, canvasEl.height / dpr);
				hasDrawn = true;
			};
			img.src = data.whiteboard.canvas_json;
		}
	});

	onDestroy(() => {
		window.removeEventListener('resize', resize);
		window.removeEventListener('keydown', handleKeyDown);
		if (saveTimer) clearTimeout(saveTimer);
	});

	// ── data cards ─────────────────────────────────────────────────────────────
	type DataCard = {
		id: string;
		tableId: string;
		tableName: string;
		row: Record<string, unknown>;
		x: number;
		y: number;
	};

	type SchemaTable = { id: string; name: string; fields: { id: string; name: string; type: string }[] };
	let tables = $derived((data.tables ?? []) as SchemaTable[]);

	// dropdown state
	let cardMenuOpen = $state(false);
	let selectedTableId = $state('');
	let selectedRowIndex = $state(0);

	// row fetch state
	let rowsByTableId = $state<Record<string, Record<string, unknown>[]>>({});
	let rowsLoading = $state(false);
	let rowsError = $state('');

	async function loadRows(tableId: string) {
		const tbl = tables.find((t) => t.id === tableId);
		if (!tbl) return;
		if (rowsByTableId[tableId]) return; // already cached
		rowsLoading = true;
		rowsError = '';
		try {
			const res = await fetch('/api/sql/run', {
				method:  'POST',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify({
					sql:       `SELECT * FROM ${tbl.name} LIMIT 50`,
					projectId: data.project?.id ?? '',
				}),
			});
			const payload = await res.json();
			if (!res.ok || payload.error) {
				rowsError = payload.error ?? 'failed to load rows';
				return;
			}
			rowsByTableId = {
				...rowsByTableId,
				[tableId]: (payload.rows ?? []) as Record<string, unknown>[],
			};
		} catch {
			rowsError = "couldn't load rows — try again";
		} finally {
			rowsLoading = false;
		}
	}

	// pick first table once tables are available
	$effect(() => {
		if (tables.length > 0 && !tables.find((t) => t.id === selectedTableId)) {
			selectedTableId = tables[0].id;
			selectedRowIndex = 0;
		}
	});

	// fetch rows whenever the selected table changes
	$effect(() => {
		if (selectedTableId) loadRows(selectedTableId);
	});

	let selectedTable = $derived(tables.find((t) => t.id === selectedTableId) ?? tables[0]);
	let selectedRows = $derived(rowsByTableId[selectedTableId] ?? []);

	// placed cards
	let placedCards = $state<DataCard[]>([]);
	let cardCounter = 0;

	function addCard() {
		if (!selectedTable || selectedRows.length === 0) return;
		const row = selectedRows[selectedRowIndex] as Record<string, unknown>;
		placedCards = [...placedCards, {
			id:        `card-${++cardCounter}`,
			tableId:   selectedTable.id,
			tableName: selectedTable.name,
			row,
			x: 120 + Math.random() * 300,
			y: 100 + Math.random() * 200,
		}];
		cardMenuOpen = false;
		hasDrawn = true;
	}

	function removeCard(id: string) {
		placedCards = placedCards.filter((c) => c.id !== id);
	}

	// drag logic for cards
	let draggingCardId = $state<string | null>(null);
	let dragOffsetX = 0;
	let dragOffsetY = 0;

	function startCardDrag(e: PointerEvent, cardId: string) {
		e.stopPropagation();
		const cardEl = (e.currentTarget as HTMLElement).closest('[data-card]') as HTMLElement;
		if (!cardEl) return;
		const rect = cardEl.getBoundingClientRect();
		dragOffsetX = e.clientX - rect.left;
		dragOffsetY = e.clientY - rect.top;
		draggingCardId = cardId;
		cardEl.setPointerCapture(e.pointerId);
	}

	function onCardPointerMove(e: PointerEvent) {
		if (!draggingCardId || !canvasEl) return;
		const canvasRect = canvasEl.getBoundingClientRect();
		const newX = e.clientX - canvasRect.left - dragOffsetX;
		const newY = e.clientY - canvasRect.top - dragOffsetY;
		placedCards = placedCards.map((c) =>
			c.id === draggingCardId ? { ...c, x: Math.max(0, newX), y: Math.max(0, newY) } : c,
		);
	}

	function stopCardDrag() {
		draggingCardId = null;
	}

	function fmtVal(v: unknown): string {
		if (v == null) return '—';
		if (typeof v === 'boolean') return v ? 'yes' : 'no';
		if (typeof v === 'number') return v.toLocaleString();
		const s = String(v);
		return s.length > 22 ? s.slice(0, 22) + '…' : s;
	}

	const accentColor = '#4f8ef7';

	let saveIndicatorText = $derived(
		saveState === 'saving'  ? 'saving…' :
		saveState === 'unsaved' ? 'unsaved' :
		'saved'
	);
	let saveIndicatorColor = $derived(
		saveState === 'saving'  ? '#f59e0b' :
		saveState === 'unsaved' ? '#fb7185' :
		'#22d3a5'
	);
</script>

<div
	class="relative -mt-12"
	style="height: calc(100vh - 6rem); background: var(--color-bg); overflow: hidden;"
	onpointermove={onCardPointerMove}
	onpointerup={stopCardDrag}
>

	<!-- ── toolbar ── -->
	<div class="absolute top-3 left-3 z-20 flex flex-col gap-2">

		<!-- row 1: tools + undo + download + clear + save indicator -->
		<div class="flex items-center gap-1 glass border border-[var(--color-border)] rounded-xl px-3 py-2">
			{#each TOOLS as [t, icon, label]}
				<button
					onclick={() => { tool = t; if (t !== 'text') pendingText = ''; }}
					class="flex items-center justify-center w-7 h-7 rounded-lg text-xs transition-all font-[var(--font-ui)]"
					style="background:{tool === t ? 'rgba(79,142,247,0.18)' : 'transparent'}; color:{tool === t ? '#4f8ef7' : 'var(--color-muted)'}; border:1px solid {tool === t ? 'rgba(79,142,247,0.4)' : 'transparent'};"
					title={label}
				>{icon}</button>
			{/each}

			<div class="w-px h-4 bg-[var(--color-border)] mx-1"></div>

			<button onclick={undo} class="flex items-center justify-center w-7 h-7 rounded-lg text-xs text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors" title="Undo (Ctrl+Z)">↩</button>
			<button onclick={downloadCanvas} class="flex items-center justify-center w-7 h-7 rounded-lg text-xs text-[var(--color-muted)] hover:text-[var(--color-electric)] transition-colors" title="Download PNG">↓</button>

			<div class="w-px h-4 bg-[var(--color-border)] mx-1"></div>

			<button onclick={clearCanvas} class="text-[var(--color-muted)] hover:text-[var(--color-danger)] font-[var(--font-ui)] text-[11px] px-1 transition-colors cursor-pointer">clear</button>

			<div class="w-px h-4 bg-[var(--color-border)] mx-1"></div>

			<!-- save indicator -->
			<div class="flex items-center gap-1.5 ml-0.5" title="autosaves 2s after a change">
				<span class="w-1.5 h-1.5 rounded-full" style="background:{saveIndicatorColor};"></span>
				<span class="text-[10px] font-[var(--font-ui)] text-[var(--color-muted)]">{saveIndicatorText}</span>
			</div>
		</div>

		<!-- row 2: colors + thickness -->
		<div class="flex items-center gap-2 glass border border-[var(--color-border)] rounded-xl px-3 py-2">
			<div class="flex items-center gap-1.5">
				{#each colors as c}
					<button
						onclick={() => (color = c)}
						style="width:16px; height:16px; border-radius:50%; background:{c}; border:2px solid {color === c ? 'white' : 'transparent'}; cursor:pointer; transition:border-color 0.1s;"
						aria-label="color {c}"
					></button>
				{/each}
			</div>
			<div class="w-px h-4 bg-[var(--color-border)] mx-1"></div>
			<div class="flex items-center gap-1">
				{#each [2, 4, 8] as t}
					<button
						onclick={() => (thickness = t)}
						class="flex items-center justify-center rounded cursor-pointer transition-colors"
						style="width:24px; height:24px; background:{thickness === t ? 'rgba(255,255,255,0.12)' : 'transparent'};"
						aria-label="thickness {t}"
					>
						<span style="width:{t * 1.5}px; height:{t * 1.5}px; border-radius:50%; background:var(--color-text); display:block;"></span>
					</button>
				{/each}
			</div>
		</div>

		<!-- row 3: text input (only when text tool active) -->
		{#if tool === 'text'}
			<div class="flex items-center gap-2 glass border border-[rgba(79,142,247,0.3)] rounded-xl px-3 py-2">
				<input
					type="text"
					bind:value={pendingText}
					placeholder="type, then click canvas…"
					class="bg-transparent text-xs text-[var(--color-text)] font-[var(--font-ui)] outline-none w-48 placeholder:text-[var(--color-muted)]"
					autofocus
				/>
			</div>
		{/if}

		<!-- row 4: add data card button + dropdown -->
		<div class="relative">
			<button
				onclick={() => (cardMenuOpen = !cardMenuOpen)}
				class="flex items-center gap-2 glass border rounded-xl px-3 py-2 text-xs font-[var(--font-ui)] transition-all w-full"
				style="border-color:{cardMenuOpen ? accentColor + '60' : 'var(--color-border)'}; color:{cardMenuOpen ? accentColor : 'var(--color-muted)'};"
			>
				<span style="font-size:14px;">⊞</span>
				add data card
				<span class="ml-auto" style="font-size:10px; opacity:0.6;">{cardMenuOpen ? '▲' : '▼'}</span>
			</button>

			{#if cardMenuOpen}
				<div
					class="absolute top-full mt-1.5 left-0 z-30 glass border border-[var(--color-border)] rounded-xl overflow-hidden"
					style="width:260px; box-shadow:0 8px 32px rgba(0,0,0,0.6);"
				>
					<!-- TABLE section -->
					<div class="px-3 pt-3 pb-3">
						<p class="text-[9px] text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest mb-2">table</p>
						{#if tables.length === 0}
							<p class="text-[11px] text-[var(--color-muted)] font-[var(--font-ui)] italic">no tables in this project yet</p>
						{:else}
							<div class="flex flex-wrap gap-1.5">
								{#each tables as tbl}
									<button
										onclick={() => { selectedTableId = tbl.id; selectedRowIndex = 0; }}
										class="px-2.5 py-1.5 rounded-lg text-[11px] font-[var(--font-ui)] font-medium transition-all"
										style="background:{selectedTableId === tbl.id ? accentColor + '28' : 'rgba(255,255,255,0.06)'}; color:{selectedTableId === tbl.id ? accentColor : 'var(--color-text)'}; border:1px solid {selectedTableId === tbl.id ? accentColor + '55' : 'rgba(255,255,255,0.08)'};"
									>{tbl.name}</button>
								{/each}
							</div>
						{/if}
					</div>

					<div class="h-px bg-[var(--color-border)]"></div>

					<!-- ROW section -->
					<div class="px-3 py-3">
						<p class="text-[9px] text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest mb-2">row</p>
						{#if rowsLoading}
							<p class="text-[11px] text-[var(--color-muted)] font-[var(--font-ui)] italic px-2.5 py-2">loading rows…</p>
						{:else if rowsError}
							<p class="text-[11px] text-[var(--color-danger)] font-[var(--font-ui)] px-2.5 py-2">{rowsError}</p>
						{:else if selectedRows.length === 0}
							<p class="text-[11px] text-[var(--color-muted)] font-[var(--font-ui)] italic px-2.5 py-2">no rows in this table</p>
						{:else}
							<div class="flex flex-col gap-0.5 max-h-44 overflow-y-auto pr-1" style="scrollbar-width:thin;">
								{#each selectedRows as row, i}
									{@const label = String(row['name'] ?? row['title'] ?? row['author_name'] ?? row['id'] ?? i + 1)}
									{@const isSelected = selectedRowIndex === i}
									<button
										onclick={() => (selectedRowIndex = i)}
										class="text-left w-full px-2.5 py-2 rounded-lg transition-all"
										style="background:{isSelected ? accentColor + '22' : 'transparent'}; border:1px solid {isSelected ? accentColor + '44' : 'transparent'};"
									>
										<span
											class="text-[12px] font-[var(--font-ui)] block truncate leading-tight"
											style="color:{isSelected ? accentColor : 'var(--color-text)'};"
										>{label}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>

					<div class="h-px bg-[var(--color-border)]"></div>

					<!-- PLACE button -->
					<div class="px-3 py-3">
						<button
							onclick={addCard}
							disabled={rowsLoading || selectedRows.length === 0}
							class="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-[12px] font-[var(--font-display)] font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none"
							style="background:{accentColor}28; color:{accentColor}; border:1px solid {accentColor}50;"
						>
							＋ place on board
						</button>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- ── idle hint ── -->
	{#if !hasDrawn && placedCards.length === 0}
		<div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none" style="z-index:1;">
			<p class="font-[var(--font-display)] text-[var(--color-muted)] opacity-30" style="font-size:clamp(1rem,3vw,1.5rem);">
				draw anything ✏️
			</p>
		</div>
	{/if}

	<!-- ── canvas ── -->
	<canvas
		bind:this={canvasEl}
		class="absolute inset-0 w-full h-full"
		style="cursor:{tool === 'eraser' ? 'cell' : tool === 'text' ? 'text' : 'crosshair'}; touch-action:none; z-index:2;"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={(e) => onPointerUp(e)}
		onpointercancel={(e) => onPointerUp(e)}
	></canvas>

	<!-- ── data cards overlay ── -->
	{#each placedCards as card (card.id)}
		{@const cardIndex = placedCards.indexOf(card) + 1}
		<div
			data-card
			class="absolute select-none"
			style="
				left:{card.x}px;
				top:{card.y}px;
				width:260px;
				z-index:10;
				cursor:{draggingCardId === card.id ? 'grabbing' : 'grab'};
				border-radius:12px;
				overflow:hidden;
				border:1px solid {accentColor}55;
				box-shadow:
					0 0 0 1px {accentColor}18,
					0 0 16px {accentColor}25,
					0 8px 32px rgba(0,0,0,0.7),
					inset 0 1px 0 rgba(255,255,255,0.05);
				background: linear-gradient(160deg, #0d0d18 0%, #0a0a12 100%);
			"
			onpointerdown={(e: PointerEvent) => startCardDrag(e, card.id)}
			onpointermove={onCardPointerMove}
			onpointerup={stopCardDrag}
		>

			<!-- animated top glow bar -->
			<div style="
				height:2px;
				background:linear-gradient(90deg, transparent 0%, {accentColor} 40%, {accentColor}cc 60%, transparent 100%);
				opacity:0.9;
			"></div>

			<!-- header -->
			<div style="
				padding:8px 12px 7px;
				background:linear-gradient(180deg, {accentColor}14 0%, transparent 100%);
				border-bottom:1px solid {accentColor}28;
				display:flex;
				align-items:center;
				justify-content:space-between;
				gap:8px;
			">
				<!-- left: table name + card number -->
				<div style="display:flex; align-items:center; gap:6px; min-width:0;">
					<span style="
						width:5px; height:5px; border-radius:50%;
						background:{accentColor};
						box-shadow:0 0 6px {accentColor};
						flex-shrink:0;
						display:inline-block;
					"></span>
					<span style="
						font-family:var(--font-body);
						font-size:10px;
						font-weight:700;
						letter-spacing:0.12em;
						color:{accentColor};
						text-transform:uppercase;
						overflow:hidden;
						text-overflow:ellipsis;
						white-space:nowrap;
					">{card.tableName}</span>
					<span style="
						font-family:var(--font-body);
						font-size:8px;
						color:{accentColor}66;
						letter-spacing:0.05em;
						flex-shrink:0;
					">#{String(cardIndex).padStart(2,'0')}</span>
				</div>

				<!-- dismiss button -->
				<button
					onclick={(e) => { e.stopPropagation(); removeCard(card.id); }}
					onpointerdown={(e: PointerEvent) => e.stopPropagation()}
					style="
						width:18px; height:18px; border-radius:4px; flex-shrink:0;
						background:rgba(248,113,113,0.12);
						border:1px solid rgba(248,113,113,0.35);
						color:#f87171;
						font-size:9px;
						display:flex; align-items:center; justify-content:center;
						cursor:pointer;
						transition:background 0.15s, border-color 0.15s;
						font-family:var(--font-ui);
						line-height:1;
					"
					title="Remove"
				>✕</button>
			</div>

			<!-- scanline overlay (decorative) -->
			<div style="
				position:absolute; inset:0; pointer-events:none; z-index:1;
				background:repeating-linear-gradient(
					0deg,
					transparent,
					transparent 3px,
					rgba(0,0,0,0.08) 3px,
					rgba(0,0,0,0.08) 4px
				);
				border-radius:12px;
			"></div>

			<!-- data rows -->
			<div style="padding:6px 0 8px; position:relative; z-index:2;">
				{#each Object.entries(card.row) as [key, val], rowI}
					<div style="
						display:flex;
						align-items:baseline;
						justify-content:space-between;
						padding:4px 12px;
						gap:8px;
						background:{rowI % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent'};
						border-left:2px solid {rowI === 0 ? accentColor + '60' : 'transparent'};
					">
						<span style="
							font-family:var(--font-body);
							font-size:8.5px;
							letter-spacing:0.1em;
							text-transform:uppercase;
							color:{accentColor}70;
							flex-shrink:0;
							white-space:nowrap;
						">{key}</span>
						<span style="
							font-family:var(--font-body);
							font-size:11px;
							color:#e2e8f0;
							text-align:right;
							word-break:break-word;
							white-space:normal;
							letter-spacing:0.02em;
							flex:1;
							min-width:0;
						">{fmtVal(val)}</span>
					</div>
				{/each}
			</div>

			<!-- bottom shimmer strip -->
			<div style="
				height:1px;
				background:linear-gradient(90deg, transparent, {accentColor}40, transparent);
				opacity:0.6;
			"></div>

		</div>
	{/each}

</div>
