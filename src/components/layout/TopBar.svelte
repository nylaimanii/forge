<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserSupabase } from '$lib/supabase';
	import { user } from '$lib/stores';
	import { showToast } from '$lib/stores/toasts';
	import { ChevronRight, Search } from 'lucide-svelte';

	interface Props {
		breadcrumbs?: { label: string; href?: string }[];
		onCommandPalette?: () => void;
	}

	let { breadcrumbs = [], onCommandPalette }: Props = $props();

	let dropdownOpen = $state(false);

	let initials = $derived(
		$user?.email ? $user.email.slice(0, 2).toUpperCase() : '??'
	);

	async function handleLogout() {
		const supabase = createBrowserSupabase();
		const { error } = await supabase.auth.signOut();
		if (error) {
			showToast('Failed to log out. Try again.', 'error');
		} else {
			goto('/login');
		}
	}

	function handleOutsideClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-dropdown]')) {
			dropdownOpen = false;
		}
	}
</script>

<svelte:window onclick={handleOutsideClick} />

<header class="fixed top-0 left-16 right-0 h-14 z-30 flex items-center px-4 gap-4 bg-[color-mix(in_srgb,var(--color-surface-1)_85%,transparent)] backdrop-blur-xl border-b border-[var(--color-border)]">

	<!-- breadcrumb -->
	<nav class="flex items-center gap-1.5 text-sm flex-1">
		<span class="text-[var(--color-muted)] font-[var(--font-ui)]">forge</span>
		{#each breadcrumbs as crumb}
			<ChevronRight size={12} class="text-[var(--color-muted)]" />
			{#if crumb.href}
				<a href={crumb.href} class="text-[var(--color-text)] hover:text-[var(--color-electric)] transition-colors font-[var(--font-ui)]">
					{crumb.label}
				</a>
			{:else}
				<span class="text-[var(--color-text)] font-[var(--font-ui)]">{crumb.label}</span>
			{/if}
		{/each}
	</nav>

	<!-- command palette trigger -->
	<button
		onclick={onCommandPalette}
		class="
			flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--color-muted)]
			glass border border-[var(--color-border)]
			hover:border-[var(--color-electric)]/30 hover:text-[var(--color-electric)]
			transition-all duration-150 min-w-[160px]
		"
	>
		<Search size={12} />
		<span class="flex-1 text-left font-[var(--font-ui)]">⌘K search...</span>
	</button>

	<!-- avatar + dropdown -->
	<div class="relative" data-dropdown>
		<button
			onclick={() => (dropdownOpen = !dropdownOpen)}
			class="
				w-8 h-8 rounded-full bg-[var(--color-electric)] text-white text-xs font-semibold
				flex items-center justify-center font-[var(--font-ui)]
				hover:shadow-[0_0_12px_var(--color-electric-glow)] transition-all duration-150
			"
			aria-label="Account menu"
		>
			{initials}
		</button>

		{#if dropdownOpen}
			<div class="absolute right-0 top-full mt-2 w-48 rounded-xl glass border border-[var(--color-border)] shadow-xl overflow-hidden py-1">
				<div class="px-3 py-2 border-b border-[var(--color-border)]">
					<p class="text-xs text-[var(--color-muted)] truncate font-[var(--font-ui)]">{$user?.email ?? ''}</p>
				</div>
				<a
					href="/settings"
					class="block px-3 py-2 text-sm text-[var(--color-text)] hover:bg-white/5 transition-colors font-[var(--font-ui)]"
					onclick={() => (dropdownOpen = false)}
				>
					Profile & Settings
				</a>
				<button
					onclick={handleLogout}
					class="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-dim)] transition-colors font-[var(--font-ui)]"
				>
					Log out
				</button>
			</div>
		{/if}
	</div>
</header>
