<script lang="ts">
  import { page } from '$app/state';
  import { demoData } from '$lib/stores/demo';
  import { showToast } from '$lib/stores/toasts';
  import { ZoomIn, ZoomOut, Plus } from 'lucide-svelte';

  let projectId = $derived(page.params.id ?? '');
  let tables = $derived($demoData.tables.filter(t => t.projectId === projectId));
  let panX = $state(0);
  let panY = $state(0);
  let zoom = $state(1);
  let isPanning = $state(false);
  let lastMouse = { x: 0, y: 0 };
  let canvasEl: HTMLDivElement | undefined = $state();

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(2.0, Math.max(0.3, zoom * delta));
    if (!canvasEl) { zoom = newZoom; return; }
    const rect = canvasEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scale = newZoom / zoom;
    panX = mouseX - scale * (mouseX - panX);
    panY = mouseY - scale * (mouseY - panY);
    zoom = newZoom;
  }

  function onPointerDown(e: PointerEvent) {
    if ((e.target as HTMLElement).closest('[data-table-card]')) return;
    isPanning = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent) {
    if (!isPanning) return;
    panX += e.clientX - lastMouse.x;
    panY += e.clientY - lastMouse.y;
    lastMouse = { x: e.clientX, y: e.clientY };
  }
  function onPointerUp() { isPanning = false; }
  function warnSave() { showToast('sign up to save changes — this is a demo', 'info'); }
</script>

<div
  bind:this={canvasEl}
  class="relative overflow-hidden bg-[var(--color-bg)] select-none"
  class:cursor-grab={!isPanning}
  class:cursor-grabbing={isPanning}
  style="height: calc(100vh - 9rem);"
  onwheel={handleWheel}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  role="application"
  aria-label="Schema canvas"
>
  <div class="absolute inset-0 opacity-[0.025] pointer-events-none"
    style="background-image: radial-gradient(circle, rgba(241,245,249,0.8) 1px, transparent 1px); background-size: 28px 28px;"
  ></div>

  <div class="absolute origin-top-left"
    style="transform: translate({panX}px, {panY}px) scale({zoom});"
  >
    {#each tables as table}
      <div data-table-card
        class="absolute w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-lg overflow-hidden"
        style="left: {table.position_x}px; top: {table.position_y}px;"
      >
        <div class="px-3 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[var(--color-electric)] shrink-0"></span>
          <span class="font-[var(--font-body)] text-xs font-bold text-[var(--color-text)] truncate">{table.name}</span>
        </div>
        <div class="py-1">
          {#each table.fields as field}
            <div class="px-3 py-1.5 flex items-center justify-between gap-2 hover:bg-white/[0.02]">
              <span class="font-[var(--font-body)] text-xs text-[var(--color-text)] truncate">{field.name}</span>
              <span class="font-[var(--font-body)] text-[10px] text-[var(--color-muted)] shrink-0">{field.type}</span>
            </div>
          {/each}
        </div>
        <button onclick={warnSave}
          class="w-full px-3 py-2 flex items-center gap-1.5 text-[var(--color-muted)] hover:text-[var(--color-electric)] text-xs font-[var(--font-ui)] border-t border-[var(--color-border)] transition-colors"
        ><Plus size={10} /> add field</button>
      </div>
    {/each}
  </div>

  <div class="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
    <button onclick={() => { zoom = Math.min(2, zoom * 1.2); }}
      class="w-8 h-8 rounded-lg glass border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
      aria-label="Zoom in"><ZoomIn size={14} /></button>
    <button onclick={() => { zoom = Math.max(0.3, zoom * 0.8); }}
      class="w-8 h-8 rounded-lg glass border border-[var(--color-border)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
      aria-label="Zoom out"><ZoomOut size={14} /></button>
  </div>

  <div class="absolute bottom-4 left-4 z-10">
    <button onclick={warnSave}
      class="flex items-center gap-2 px-3 h-8 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-electric)] text-xs font-[var(--font-ui)] transition-colors"
    ><Plus size={12} /> add table</button>
  </div>
</div>
