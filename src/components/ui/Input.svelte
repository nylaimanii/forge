<script lang="ts">
	interface Props {
		value?:       string;
		placeholder?: string;
		type?:        string;
		name?:        string;  // html name attr — required for form submissions
		label?:       string;
		error?:       string;
		disabled?:    boolean;
		autofocus?:   boolean;
		class?:       string;
		onchange?:    (e: Event) => void;
		oninput?:     (e: Event) => void;
	}

	let {
		value      = $bindable(''),
		placeholder = '',
		type        = 'text',
		name,
		label,
		error,
		disabled    = false,
		autofocus   = false,
		class: extraClass = '',
		onchange,
		oninput,
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5 {extraClass}">
	{#if label}
		<label class="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider font-[var(--font-ui)]">
			{label}
		</label>
	{/if}

	<input
		{type}
		{name}
		{placeholder}
		{disabled}
		{autofocus}
		bind:value
		onchange={onchange}
		oninput={oninput}
		class="
			w-full rounded-lg px-3 py-2 text-sm
			bg-[var(--color-surface-2)] text-[var(--color-text)]
			border border-[var(--color-border)]
			placeholder:text-[var(--color-muted)]
			font-[var(--font-ui)]
			transition-all duration-150
			focus:outline-none focus:border-[var(--color-accent)] focus:shadow-[0_0_0_3px_var(--color-accent-glow)]
			disabled:opacity-40 disabled:cursor-not-allowed
			{error ? 'border-[var(--color-danger)] focus:shadow-[0_0_0_3px_var(--color-danger-glow)]' : ''}
		"
	/>

	{#if error}
		<p class="text-xs text-[var(--color-danger)]">{error}</p>
	{/if}
</div>
