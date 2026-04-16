<script lang="ts">
	type Color = 'accent' | 'cyan' | 'danger' | 'muted' | 'default';

	interface Props {
		color?:   Color;
		class?:   string;
		children?: import('svelte').Snippet;
	}

	let { color = 'default', class: extraClass = '', children }: Props = $props();

	const colorMap: Record<Color, string> = {
		accent:  'bg-[var(--color-accent-glow)]  text-[var(--color-accent)]  border-[var(--color-accent)]/30',
		cyan:    'bg-[var(--color-cyan-glow)]    text-[var(--color-cyan)]    border-[var(--color-cyan)]/30',
		danger:  'bg-[var(--color-danger-glow)]  text-[var(--color-danger)]  border-[var(--color-danger)]/30',
		muted:   'bg-white/5                     text-[var(--color-muted)]   border-white/10',
		default: 'bg-white/5                     text-[var(--color-text)]    border-[var(--color-border)]',
	};
</script>

<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border font-[var(--font-ui)] {colorMap[color]} {extraClass}">
	{#if children}{@render children()}{/if}
</span>
