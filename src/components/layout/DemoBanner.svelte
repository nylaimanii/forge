<script lang="ts">
	import { goto } from '$app/navigation';
	import { X } from 'lucide-svelte';
</script>

<div class="fixed top-0 left-0 right-0 h-10 z-50 flex items-center justify-between px-4 bg-[var(--color-electric)] text-white text-xs font-[var(--font-ui)]">
	<!-- exit -->
	<button
		onclick={() => goto('/')}
		class="flex items-center gap-1.5 opacity-75 hover:opacity-100 transition-opacity"
		aria-label="Exit demo"
	>
		<X size={12} />
		exit demo
	</button>

	<!-- center label -->
	<span class="absolute left-1/2 -translate-x-1/2 opacity-90 hidden sm:block">
		you're in demo mode — nothing saves to the database
	</span>

	<!-- sign up CTA -->
	<a
		href="/signup"
		class="px-3 py-1 rounded-md bg-white text-[var(--color-electric)] font-semibold text-[11px] hover:shadow-[0_0_16px_rgba(255,255,255,0.35)] transition-all duration-150"
	>
		sign up free →
	</a>
</div>
