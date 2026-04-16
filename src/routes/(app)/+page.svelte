<script lang="ts">
	import Button from '$components/ui/Button.svelte';
	import { Plus } from 'lucide-svelte';
	import { user } from '$lib/stores';

	// greeting based on time of day
	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
</script>

<svelte:head>
	<title>Dashboard — Forge</title>
</svelte:head>

<!-- animated gradient mesh background -->
<div class="fixed inset-0 left-16 top-14 gradient-mesh opacity-40 pointer-events-none"></div>

<!-- page content -->
<div class="relative z-10 flex flex-col items-center justify-center min-h-full px-8 py-20">

	<!-- hero block -->
	<div class="flex flex-col items-center gap-6 text-center max-w-2xl">

		<!-- greeting -->
		<p
			class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] animate-fade-up animate-fade-up-1"
		>
			{greeting}{$user?.email ? `, ${$user.email.split('@')[0]}` : ''}
		</p>

		<!-- main headline -->
		<h1
			class="text-5xl font-extrabold tracking-tight text-[var(--color-text)] font-[var(--font-display)] leading-[1.1] animate-fade-up animate-fade-up-2"
		>
			forge
		</h1>

		<!-- tagline -->
		<p
			class="text-base text-[var(--color-muted)] font-[var(--font-ui)] max-w-md leading-relaxed animate-fade-up animate-fade-up-3"
		>
			the database builder for developers who care about design.
			<br />
			visual schemas. sql. ai. beautiful data cards. infinite canvas.
		</p>

		<!-- cta -->
		<div class="flex items-center gap-3 mt-2 animate-fade-up animate-fade-up-4">
			<Button variant="primary" size="lg">
				{#snippet icon()}
					<Plus size={16} />
				{/snippet}
				{#snippet children()}
					New project
				{/snippet}
			</Button>
			<Button variant="secondary" size="lg">
				{#snippet children()}
					Browse projects
				{/snippet}
			</Button>
		</div>

		<!-- sub-note: next phase -->
		<p class="text-xs text-[var(--color-muted)]/50 font-[var(--font-body)] mt-4 animate-fade-up animate-fade-up-5">
			project management coming in phase 2 →
		</p>
	</div>

	<!-- four pillars cards -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 w-full max-w-3xl animate-fade-up animate-fade-up-5">
		{#each [
			{ label: 'Schema Builder', desc: 'Visual ERD + SQL + AI', color: 'var(--color-accent)' },
			{ label: 'SQL Editor',     desc: 'Monaco-powered query runner', color: 'var(--color-cyan)' },
			{ label: 'Visualize',      desc: 'Cards, charts, table view', color: '#a78bfa' },
			{ label: 'Whiteboard',     desc: 'Live data on infinite canvas', color: 'var(--color-danger)' },
		] as pillar}
			<div
				class="glass rounded-xl p-4 flex flex-col gap-2 border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all duration-200 group"
			>
				<div class="w-2 h-2 rounded-full" style="background:{pillar.color}; box-shadow: 0 0 8px {pillar.color}"></div>
				<h3 class="text-sm font-semibold text-[var(--color-text)] font-[var(--font-display)]">{pillar.label}</h3>
				<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">{pillar.desc}</p>
			</div>
		{/each}
	</div>
</div>
