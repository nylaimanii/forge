<script lang="ts">
  export interface CardConfig {
    titleField?: string;
    subtitleField?: string;
    imageField?: string;
    typeField?: string;
    stat1Field?: string;
    stat2Field?: string;
    stat3Field?: string;
  }

  interface Props {
    row: any;
    config: CardConfig;
    columns: string[];
    maxValues?: Record<string, number>;
  }

  let { row, config, columns, maxValues = {} }: Props = $props();

  const PALETTES = [
    { border: '#818cf8', headerA: '#1e1b4b', headerB: '#3730a3', accent: '#818cf8', text: '#e0e7ff' },
    { border: '#38bdf8', headerA: '#082f49', headerB: '#0c4a6e', accent: '#38bdf8', text: '#e0f2fe' },
    { border: '#fb7185', headerA: '#4c0519', headerB: '#881337', accent: '#fb7185', text: '#ffe4e6' },
    { border: '#fbbf24', headerA: '#3d2800', headerB: '#78350f', accent: '#fbbf24', text: '#fef3c7' },
    { border: '#34d399', headerA: '#022c22', headerB: '#064e3b', accent: '#34d399', text: '#d1fae5' },
    { border: '#c084fc', headerA: '#2e1065', headerB: '#4c1d95', accent: '#c084fc', text: '#f3e8ff' },
  ];

  function hashStr(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
    return h;
  }

  let typeValue    = $derived(config.typeField    ? String(row[config.typeField]    ?? '') : '');
  let titleValue   = $derived(config.titleField   ? String(row[config.titleField]   ?? '—') : (row[columns[0]] != null ? String(row[columns[0]]) : '—'));
  let palette      = $derived(PALETTES[hashStr(typeValue || titleValue || 'default') % PALETTES.length]);
  let subtitleVal  = $derived(config.subtitleField ? String(row[config.subtitleField] ?? '') : '');
  let imageValue   = $derived(config.imageField   ? String(row[config.imageField]   ?? '') : '');
  let cardNumber   = $derived(row['id'] != null ? String(row['id']).padStart(3, '0') : '');

  const stat1 = $derived(config.stat1Field ? { label: config.stat1Field, value: row[config.stat1Field] } : null);
  const stat2 = $derived(config.stat2Field ? { label: config.stat2Field, value: row[config.stat2Field] } : null);
  const stat3 = $derived(config.stat3Field ? { label: config.stat3Field, value: row[config.stat3Field] } : null);

  function isImageURL(s: string): boolean {
    return /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg|avif)(\?.*)?$/i.test(s);
  }

  function initials(title: string): string {
    const parts = title.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return title.trim().slice(0, 2).toUpperCase() || '??';
  }

  function statPercent(field: string, value: unknown): number {
    if (typeof value !== 'number') return 0;
    const max = maxValues[field] ?? value;
    return max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  }

  function fmtValue(v: unknown): string {
    if (v == null) return '—';
    if (typeof v === 'boolean') return v ? 'yes' : 'no';
    if (typeof v === 'number') return v.toLocaleString();
    return String(v);
  }

  let hovered = $state(false);
</script>

<!-- card shell — fixed 200 px wide to match CardView grid -->
<div
  class="relative w-[200px] rounded-2xl overflow-hidden select-none cursor-default transition-all duration-300"
  style="
    border: 2.5px solid {palette.border};
    box-shadow: {hovered
      ? `0 0 0 1px ${palette.border}55, 0 12px 40px ${palette.border}50, inset 0 1px 0 rgba(255,255,255,0.08)`
      : '0 4px 16px rgba(0,0,0,0.4)'};
    transform: {hovered ? 'translateY(-4px) scale(1.02)' : 'none'};
  "
  role="article"
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
>

  <!-- ── holographic shimmer overlay (only visible on hover) ── -->
  <div
    class="absolute inset-0 pointer-events-none z-10 rounded-2xl transition-opacity duration-300"
    style="
      opacity: {hovered ? 0.07 : 0};
      background: linear-gradient(135deg,
        transparent 0%,
        {palette.accent}99 25%,
        transparent 50%,
        {palette.accent}66 75%,
        transparent 100%
      );
    "
  ></div>

  <!-- ── header zone ── -->
  <div
    class="relative flex flex-col items-center justify-center gap-2 pt-4 pb-3"
    style="background: linear-gradient(160deg, {palette.headerA} 0%, {palette.headerB} 100%);"
  >
    <!-- card number top-left -->
    {#if cardNumber}
      <span
        class="absolute top-2 left-2.5 font-[var(--font-body)] font-bold"
        style="font-size: 9px; color: {palette.accent}; letter-spacing: 0.1em; opacity: 0.85;"
      >#{cardNumber}</span>
    {/if}

    <!-- type badge top-right -->
    {#if typeValue}
      <span
        class="absolute top-2 right-2 px-1.5 py-0.5 rounded-md font-[var(--font-ui)] font-bold"
        style="font-size: 8px; background: {palette.accent}22; color: {palette.accent}; border: 1px solid {palette.accent}44; letter-spacing: 0.04em;"
      >{typeValue}</span>
    {/if}

    <!-- avatar / image -->
    {#if imageValue && isImageURL(imageValue)}
      <img
        src={imageValue}
        alt={titleValue}
        class="w-20 h-20 rounded-xl object-cover"
        style="box-shadow: 0 4px 20px {palette.border}60;"
      />
    {:else}
      <div
        class="w-20 h-20 rounded-xl flex items-center justify-center font-[var(--font-display)] font-black"
        style="
          font-size: 28px;
          background: linear-gradient(135deg, {palette.border}30, {palette.border}10);
          border: 1.5px solid {palette.border}40;
          color: {palette.text};
          box-shadow: 0 4px 20px {palette.border}30;
          letter-spacing: -0.02em;
        "
      >{initials(titleValue)}</div>
    {/if}

    <!-- title -->
    <p
      class="w-full px-3 text-center font-[var(--font-display)] font-bold leading-tight truncate"
      style="font-size: 13px; color: {palette.text};"
    >{titleValue}</p>

    <!-- subtitle -->
    {#if subtitleVal}
      <p
        class="w-full px-3 -mt-1 text-center font-[var(--font-ui)] truncate"
        style="font-size: 10px; color: {palette.accent}; opacity: 0.85;"
      >{subtitleVal}</p>
    {/if}
  </div>

  <!-- ── divider line with accent glow ── -->
  <div style="height: 1.5px; background: linear-gradient(90deg, transparent, {palette.border}, transparent);"></div>

  <!-- ── stat block ── -->
  <div
    class="px-3 py-2.5 flex flex-col gap-2"
    style="background: #0d0d14;"
  >
    {#each [stat1, stat2, stat3].filter(Boolean) as stat}
      {#if stat}
        {@const pct = statPercent(stat.label, stat.value)}
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span
              class="font-[var(--font-ui)] uppercase"
              style="font-size: 9px; letter-spacing: 0.08em; color: {palette.accent}; opacity: 0.7;"
            >{stat.label.slice(0, 10)}</span>
            <span
              class="font-[var(--font-body)] font-bold"
              style="font-size: 11px; color: {palette.text};"
            >{fmtValue(stat.value)}</span>
          </div>
          {#if typeof stat.value === 'number'}
            <div class="w-full rounded-full overflow-hidden" style="height: 3px; background: rgba(255,255,255,0.06);">
              <div
                class="h-full rounded-full transition-all duration-700"
                style="width: {pct}%; background: linear-gradient(90deg, {palette.border}, {palette.accent});"
              ></div>
            </div>
          {/if}
        </div>
      {/if}
    {/each}

    <!-- empty state when no stats configured -->
    {#if !stat1 && !stat2 && !stat3}
      <p class="text-center font-[var(--font-ui)]" style="font-size: 10px; color: rgba(255,255,255,0.2); padding: 4px 0;">
        no stats — use card designer
      </p>
    {/if}
  </div>

  <!-- ── footer ── -->
  <div
    class="flex items-center justify-between px-3 py-1.5"
    style="background: #09090f; border-top: 1px solid {palette.border}22;"
  >
    <span
      class="font-[var(--font-ui)] uppercase"
      style="font-size: 7px; letter-spacing: 0.15em; color: {palette.border}; opacity: 0.5;"
    >forge · demo</span>
    <span
      class="font-[var(--font-body)]"
      style="font-size: 7px; color: {palette.accent}; opacity: 0.4;"
    >◆</span>
  </div>

</div>
