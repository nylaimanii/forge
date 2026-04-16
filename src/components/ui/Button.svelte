<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size    = 'sm' | 'md' | 'lg';

	interface Props {
		variant?:  Variant;
		size?:     Size;
		disabled?: boolean;
		type?:     'button' | 'submit' | 'reset';
		class?:    string;
		onclick?:  (e: MouseEvent) => void;
		children?: Snippet;
		icon?:     Snippet;
	}

	let {
		variant  = 'primary',
		size     = 'md',
		disabled = false,
		type     = 'button',
		class:   extraClass = '',
		onclick,
		children,
		icon
	}: Props = $props();

	// size → padding / font-size map
	const sizeMap: Record<Size, string> = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2   text-sm',
		lg: 'px-6 py-3   text-base',
	};

	// variant → visual style map
	const variantMap: Record<Variant, string> = {
		primary:   'bg-[var(--color-accent)] text-white font-medium hover:brightness-110 hover:shadow-[0_0_24px_var(--color-accent-glow)] active:scale-[0.97]',
		secondary: 'glass text-[var(--color-text)] hover:border-[var(--color-accent)] hover:shadow-[0_0_16px_var(--color-accent-glow)] active:scale-[0.97]',
		ghost:     'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 active:scale-[0.97]',
		danger:    'bg-[var(--color-danger)] text-white font-medium hover:brightness-110 hover:shadow-[0_0_24px_var(--color-danger-glow)] active:scale-[0.97]',
	};

	const base = 'inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none font-[var(--font-ui)]';
</script>

<button
	{type}
	{disabled}
	onclick={onclick}
	class="{base} {sizeMap[size]} {variantMap[variant]} {extraClass}"
>
	{#if icon}
		{@render icon()}
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
