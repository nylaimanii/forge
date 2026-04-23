<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/state';
  import { demoData } from '$lib/stores/demo';
  import { showToast } from '$lib/stores/toasts';

  // ── canvas refs ────────────────────────────────────────────────────────────
  let canvasEl: HTMLCanvasElement | undefined = $state();
  let ctx: CanvasRenderingContext2D | null = null;

  // ── drawing state ──────────────────────────────────────────────────────────
  let drawing = $state(false);
  let color = $state('#00d9ff');
  let thickness = $state(4);
  let hasDrawn = $state(false);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;
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

    if (!hasDrawn) {
      hasDrawn = true;
      if (!toastTimer) {
        toastTimer = setTimeout(() => {
          showToast('sign up free to save your whiteboard', 'info');
          toastTimer = null;
        }, 800);
      }
    }
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
      return;
    }
    drawing = false;
    ctx?.beginPath();
    lineStart = null;
  }

  function clearCanvas() {
    if (!ctx || !canvasEl) return;
    saveSnapshot();
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);
    hasDrawn = false;
  }

  // ── lifecycle ──────────────────────────────────────────────────────────────
  onMount(() => {
    if (!canvasEl) return;
    ctx = canvasEl.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', handleKeyDown);
  });

  onDestroy(() => {
    window.removeEventListener('resize', resize);
    window.removeEventListener('keydown', handleKeyDown);
    if (toastTimer) clearTimeout(toastTimer);
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

  let projectId = $derived(page.params.id ?? '');
  let projectTables = $derived($demoData.tables.filter(t => t.projectId === projectId));

  // dropdown state
  let cardMenuOpen = $state(false);
  let selectedTableId = $state('');
  let selectedRowIndex = $state(0);

  // sync selectedTableId when project changes
  $effect(() => {
    if (projectTables.length > 0 && !projectTables.find(t => t.id === selectedTableId)) {
      selectedTableId = projectTables[0].id;
      selectedRowIndex = 0;
    }
  });

  let selectedTable = $derived(projectTables.find(t => t.id === selectedTableId) ?? projectTables[0]);
  let selectedRows = $derived(selectedTable ? ($demoData.rowsByTable[selectedTable.id] ?? []) : []);

  // placed cards
  let placedCards = $state<DataCard[]>([]);
  let cardCounter = 0;

  function addCard() {
    if (!selectedTable || selectedRows.length === 0) return;
    const row = selectedRows[selectedRowIndex] as Record<string, unknown>;
    placedCards = [...placedCards, {
      id: `card-${++cardCounter}`,
      tableId: selectedTable.id,
      tableName: selectedTable.name,
      row,
      x: 120 + Math.random() * 300,
      y: 100 + Math.random() * 200,
    }];
    cardMenuOpen = false;
    hasDrawn = true;
  }

  function removeCard(id: string) {
    placedCards = placedCards.filter(c => c.id !== id);
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
    placedCards = placedCards.map(c =>
      c.id === draggingCardId ? { ...c, x: Math.max(0, newX), y: Math.max(0, newY) } : c
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

  // accent color per project
  const PROJECT_COLORS: Record<string, string> = {
    'demo-1': '#4f8ef7',
    'demo-2': '#22d3a5',
    'demo-3': '#f59e0b',
  };
  let accentColor = $derived(PROJECT_COLORS[projectId] ?? '#4f8ef7');
</script>

<div
  class="relative -mt-12"
  style="height: calc(100vh - 6rem); background: var(--color-bg); overflow: hidden;"
  onpointermove={onCardPointerMove}
  onpointerup={stopCardDrag}
>

  <!-- ── toolbar ── -->
  <div class="absolute top-3 left-3 z-20 flex flex-col gap-2">

    <!-- row 1: tools + undo + download + clear -->
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
          style="width:240px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);"
        >
          <!-- table picker -->
          <div class="px-3 pt-3 pb-2">
            <p class="text-[9px] text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest mb-1.5">table</p>
            <div class="flex flex-wrap gap-1">
              {#each projectTables as tbl}
                <button
                  onclick={() => { selectedTableId = tbl.id; selectedRowIndex = 0; }}
                  class="px-2 py-1 rounded-lg text-[10px] font-[var(--font-ui)] transition-all"
                  style="background:{selectedTableId === tbl.id ? accentColor + '22' : 'rgba(255,255,255,0.04)'}; color:{selectedTableId === tbl.id ? accentColor : 'var(--color-muted)'}; border:1px solid {selectedTableId === tbl.id ? accentColor + '44' : 'transparent'};"
                >{tbl.name}</button>
              {/each}
            </div>
          </div>

          <div class="h-px bg-[var(--color-border)]"></div>

          <!-- row picker -->
          <div class="px-3 py-2">
            <p class="text-[9px] text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest mb-1.5">row</p>
            <div class="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
              {#each selectedRows as row, i}
                {@const label = String(row['name'] ?? row['title'] ?? row['author_name'] ?? row['id'] ?? i + 1)}
                <button
                  onclick={() => (selectedRowIndex = i)}
                  class="text-left px-2 py-1.5 rounded-lg text-[10px] font-[var(--font-ui)] transition-all truncate"
                  style="background:{selectedRowIndex === i ? accentColor + '18' : 'transparent'}; color:{selectedRowIndex === i ? accentColor : 'var(--color-muted)'};"
                >{label}</button>
              {/each}
            </div>
          </div>

          <div class="h-px bg-[var(--color-border)]"></div>

          <!-- place button -->
          <div class="px-3 py-2.5">
            <button
              onclick={addCard}
              class="w-full flex items-center justify-center gap-1.5 h-7 rounded-lg text-[11px] font-[var(--font-display)] font-semibold transition-all"
              style="background:{accentColor}22; color:{accentColor}; border:1px solid {accentColor}44;"
            >
              ＋ place on board
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- ── sign-up nudge ── -->
  <div class="absolute top-3 right-3 z-20">
    <a
      href="/signup"
      class="inline-flex items-center gap-1.5 glass border border-[var(--color-electric)]/30 rounded-lg px-3 py-1.5 text-[var(--color-electric)] font-[var(--font-ui)] text-[11px] hover:border-[var(--color-electric)]/60 transition-colors"
    >sign up to save →</a>
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
    <div
      data-card
      class="absolute rounded-xl overflow-hidden select-none"
      style="
        left:{card.x}px;
        top:{card.y}px;
        width:200px;
        z-index:10;
        background:var(--color-surface-1);
        border:1.5px solid {accentColor}44;
        box-shadow:0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px {accentColor}18;
        cursor:{draggingCardId === card.id ? 'grabbing' : 'grab'};
      "
      onpointerdown={(e: PointerEvent) => startCardDrag(e, card.id)}
      onpointermove={onCardPointerMove}
      onpointerup={stopCardDrag}
    >
      <!-- card header -->
      <div
        class="flex items-center justify-between px-3 py-2"
        style="background:{accentColor}18; border-bottom:1px solid {accentColor}30;"
      >
        <span
          class="text-[10px] font-[var(--font-ui)] font-semibold uppercase tracking-wider truncate"
          style="color:{accentColor};"
        >{card.tableName}</span>
        <button
          onclick={(e) => { e.stopPropagation(); removeCard(card.id); }}
          class="flex items-center justify-center w-4 h-4 rounded-full text-[9px] transition-all shrink-0 ml-2"
          style="background:rgba(248,113,113,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3);"
          title="Remove card"
          onpointerdown={(e: PointerEvent) => e.stopPropagation()}
        >✕</button>
      </div>

      <!-- card fields -->
      <div class="flex flex-col py-1.5">
        {#each Object.entries(card.row).slice(0, 6) as [key, val]}
          <div class="flex items-center justify-between px-3 py-1 gap-2 hover:bg-white/[0.025] transition-colors">
            <span class="text-[9px] font-[var(--font-ui)] uppercase tracking-wider shrink-0" style="color:var(--color-muted);">{key}</span>
            <span class="text-[10px] font-[var(--font-body)] truncate text-right" style="color:var(--color-text); max-width:100px;">{fmtVal(val)}</span>
          </div>
        {/each}
      </div>
    </div>
  {/each}

</div>
