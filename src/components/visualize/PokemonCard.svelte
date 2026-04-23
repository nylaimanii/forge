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

<!-- card shell -->
<div
  class="relative w-[200px] rounded-2xl overflow-hidden select-none cursor-default transition-all duration-300"
  style="
    border: 1.5px solid {palette.border}88;
    box-shadow: {hovered
      ? `0 0 0 1px ${palette.border}44, 0 0 32px ${palette.border}55, 0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)`
      : `0 0 12px ${palette.border}22, 0 6px 24px rgba(0,0,0,0.5)`};
    transform: {hovered ? 'translateY(-5px) scale(1.025)' : 'none'};
    background: #05050a;
  "
  role="article"
  onmouseenter={() => (hovered = true)}
  onmouseleave={() => (hovered = false)}
>

  <!-- top neon edge bar -->
  <div style="
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, {palette.border}aa 30%, {palette.accent} 50%, {palette.border}aa 70%, transparent 100%);
    box-shadow: 0 0 8px {palette.accent};
  "></div>

  <!-- corner brackets — top left -->
  <div class="absolute pointer-events-none" style="top:6px; left:6px; z-index:20;">
    <div style="width:10px; height:10px; border-top:1.5px solid {palette.accent}; border-left:1.5px solid {palette.accent}; opacity:0.7;"></div>
  </div>
  <!-- corner brackets — top right -->
  <div class="absolute pointer-events-none" style="top:6px; right:6px; z-index:20;">
    <div style="width:10px; height:10px; border-top:1.5px solid {palette.accent}; border-right:1.5px solid {palette.accent}; opacity:0.7;"></div>
  </div>
  <!-- corner brackets — bottom left -->
  <div class="absolute pointer-events-none" style="bottom:6px; left:6px; z-index:20;">
    <div style="width:10px; height:10px; border-bottom:1.5px solid {palette.accent}; border-left:1.5px solid {palette.accent}; opacity:0.7;"></div>
  </div>
  <!-- corner brackets — bottom right -->
  <div class="absolute pointer-events-none" style="bottom:6px; right:6px; z-index:20;">
    <div style="width:10px; height:10px; border-bottom:1.5px solid {palette.accent}; border-right:1.5px solid {palette.accent}; opacity:0.7;"></div>
  </div>

  <!-- holographic shimmer overlay -->
  <div
    class="absolute inset-0 pointer-events-none z-10 rounded-2xl transition-opacity duration-300"
    style="
      opacity: {hovered ? 0.06 : 0};
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
    class="relative flex flex-col items-center justify-center gap-2 pt-5 pb-3"
    style="
      background:
        linear-gradient(160deg, {palette.headerA} 0%, {palette.headerB} 100%);
      background-image:
        linear-gradient(160deg, {palette.headerA} 0%, {palette.headerB} 100%),
        repeating-linear-gradient(0deg, transparent, transparent 18px, {palette.border}08 18px, {palette.border}08 19px),
        repeating-linear-gradient(90deg, transparent, transparent 18px, {palette.border}08 18px, {palette.border}08 19px);
      background-blend-mode: normal, overlay, overlay;
    "
  >
    <!-- card number badge -->
    {#if cardNumber}
      <div class="absolute top-2.5 left-2.5 flex items-center gap-1">
        <span style="width:4px; height:4px; border-radius:50%; background:{palette.accent}; box-shadow:0 0 5px {palette.accent}; display:inline-block;"></span>
        <span
          class="font-[var(--font-body)] font-bold"
          style="font-size: 8px; color: {palette.accent}; letter-spacing: 0.12em; opacity: 0.9;"
        >#{cardNumber}</span>
      </div>
    {/if}

    <!-- type badge -->
    {#if typeValue}
      <span
        class="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded font-[var(--font-body)] font-bold"
        style="font-size: 7px; background: {palette.accent}18; color: {palette.accent}; border: 1px solid {palette.accent}50; letter-spacing: 0.1em; text-transform:uppercase;"
      >{typeValue}</span>
    {/if}

    <!-- avatar — hexagon scanner style -->
    {#if imageValue && isImageURL(imageValue)}
      <div style="position:relative; width:76px; height:76px;">
        <div style="
          width:76px; height:76px; border-radius:18px;
          border: 2px solid {palette.border}66;
          box-shadow: 0 0 16px {palette.border}55, inset 0 0 12px {palette.border}22;
          overflow:hidden;
        ">
          <img src={imageValue} alt={titleValue} style="width:100%; height:100%; object-fit:cover;" />
        </div>
      </div>
    {:else}
      <div style="position:relative; width:76px; height:76px;">
        <!-- hex ring -->
        <div style="
          position:absolute; inset:-3px;
          border-radius:20px;
          border: 1px solid {palette.border}55;
          box-shadow: 0 0 12px {palette.border}40;
        "></div>
        <!-- scan line -->
        <div style="
          position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg, transparent, {palette.accent}cc, transparent);
          box-shadow:0 0 6px {palette.accent};
          opacity:{hovered ? 0.9 : 0.4};
          transition:opacity 0.3s;
        "></div>
        <!-- main tile -->
        <div style="
          width:76px; height:76px;
          border-radius:18px;
          display:flex; align-items:center; justify-content:center;
          background: linear-gradient(145deg, {palette.border}28 0%, {palette.border}08 100%);
          border: 1.5px solid {palette.border}50;
          box-shadow: 0 0 20px {palette.border}30, inset 0 1px 0 rgba(255,255,255,0.06);
        ">
          <!-- corner ticks inside avatar -->
          <div style="position:absolute; top:5px; left:5px; width:7px; height:7px; border-top:1px solid {palette.accent}80; border-left:1px solid {palette.accent}80;"></div>
          <div style="position:absolute; top:5px; right:5px; width:7px; height:7px; border-top:1px solid {palette.accent}80; border-right:1px solid {palette.accent}80;"></div>
          <div style="position:absolute; bottom:5px; left:5px; width:7px; height:7px; border-bottom:1px solid {palette.accent}80; border-left:1px solid {palette.accent}80;"></div>
          <div style="position:absolute; bottom:5px; right:5px; width:7px; height:7px; border-bottom:1px solid {palette.accent}80; border-right:1px solid {palette.accent}80;"></div>
          <span
            style="
              font-family: var(--font-display);
              font-size: 26px;
              font-weight: 900;
              color: {palette.text};
              letter-spacing: -0.03em;
              text-shadow: 0 0 20px {palette.accent}99;
            "
          >{initials(titleValue)}</span>
        </div>
      </div>
    {/if}

    <!-- title -->
    <p
      class="w-full px-3 text-center font-[var(--font-display)] font-bold leading-tight"
      style="font-size: 13px; color: {palette.text}; text-shadow: 0 0 12px {palette.accent}44; word-break:break-word;"
    >{titleValue}</p>

    <!-- subtitle -->
    {#if subtitleVal}
      <p
        class="w-full px-4 -mt-1 text-center font-[var(--font-body)] truncate"
        style="font-size: 9px; color: {palette.accent}; opacity: 0.8; letter-spacing:0.06em; text-transform:uppercase;"
      >{subtitleVal}</p>
    {/if}
  </div>

  <!-- divider -->
  <div style="height:1px; background:linear-gradient(90deg, transparent, {palette.border}88, transparent); box-shadow:0 0 4px {palette.border}44;"></div>

  <!-- ── stat block ── -->
  <div
    class="px-3 py-2.5 flex flex-col gap-2"
    style="background: linear-gradient(180deg, #0d0d16 0%, #09090f 100%);"
  >
    {#each [stat1, stat2, stat3].filter(Boolean) as stat}
      {#if stat}
        {@const pct = statPercent(stat.label, stat.value)}
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span
              class="font-[var(--font-body)] uppercase"
              style="font-size: 8px; letter-spacing: 0.1em; color: {palette.accent}; opacity: 0.65;"
            >{stat.label.slice(0, 12)}</span>
            <span
              class="font-[var(--font-body)] font-bold"
              style="font-size: 11px; color: {palette.text}; text-shadow:0 0 8px {palette.accent}55;"
            >{fmtValue(stat.value)}</span>
          </div>
          {#if typeof stat.value === 'number'}
            <div style="width:100%; height:3px; border-radius:9999px; background:rgba(255,255,255,0.05); overflow:hidden; position:relative;">
              <div
                style="
                  height:100%; border-radius:9999px;
                  width:{pct}%;
                  background:linear-gradient(90deg, {palette.border}88, {palette.accent});
                  box-shadow:0 0 6px {palette.accent}88;
                  transition:width 0.7s ease;
                "
              ></div>
            </div>
          {/if}
        </div>
      {/if}
    {/each}

    {#if !stat1 && !stat2 && !stat3}
      <p
        class="text-center font-[var(--font-body)]"
        style="font-size: 9px; color: {palette.border}44; padding: 4px 0; letter-spacing:0.08em;"
      >[ no stats configured ]</p>
    {/if}
  </div>

  <!-- ── footer ── -->
  <div
    class="flex items-center justify-between px-3 py-1.5"
    style="background:#07070d; border-top:1px solid {palette.border}18;"
  >
    <span
      class="font-[var(--font-body)] uppercase"
      style="font-size: 7px; letter-spacing: 0.18em; color: {palette.border}; opacity: 0.45;"
    >forge · demo</span>
    <div style="display:flex; align-items:center; gap:3px;">
      <span style="width:3px; height:3px; border-radius:50%; background:{palette.accent}; opacity:0.5; display:inline-block;"></span>
      <span style="width:3px; height:3px; border-radius:50%; background:{palette.accent}; opacity:0.3; display:inline-block;"></span>
      <span style="width:3px; height:3px; border-radius:50%; background:{palette.accent}; opacity:0.15; display:inline-block;"></span>
    </div>
  </div>

  <!-- bottom neon edge bar -->
  <div style="
    height:1.5px;
    background:linear-gradient(90deg, transparent, {palette.border}66, transparent);
    opacity:0.5;
  "></div>

</div>
