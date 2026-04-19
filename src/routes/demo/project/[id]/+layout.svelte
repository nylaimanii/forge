<script lang="ts">
	import { page } from '$app/state';
	import { demoData } from '$lib/stores/demo';
	import { Database, Code, Sparkles, Image, PenLine, LayoutDashboard } from 'lucide-svelte';
	import Tooltip from '$components/ui/Tooltip.svelte';

	let { children } = $props();

	let projectId = $derived(page.params.id);
	let project   = $derived(
		$demoData.projects.find((p) => p.id === projectId) ?? $demoData.projects[0]
	);

	const tabs = [
		{ label: 'Schema',     view: 'schema',     icon: Database  },
		{ label: 'SQL',        view: 'sql',         icon: Code      },
		{ label: 'AI',         view: 'ai',          icon: Sparkles  },
		{ label: 'Visualize',  view: 'visualize',   icon: Image     },
		{ label: 'Whiteboard', view: 'whiteboard',  icon: PenLine   },
	];

	let activeTab = $derived(
		tabs.find((t) => page.url.pathname.includes(`/${t.view}`))?.view ?? 'schema'
	);
</script>

<!--
	Demo sidebar — fixed top-10 (below 40px DemoBanner), height = 100vh - 2.5rem
-->
<aside
	class="fixed left-0 top-10 h-[calc(100vh-2.5rem)] w-16 z-30
		flex flex-col items-center py-4
		border-r border-[var(--color-border)] bg-[var(--color-surface-1)]"
>
	<!-- logo → demo dashboard -->
	<a
		href="/demo"
		class="w-9 h-9 mb-6 flex items-center justify-center rounded-xl
			bg-[var(--color-electric)] text-white font-[var(--font-display)] font-bold text-lg
			hover:shadow-[0_0_24px_var(--color-electric-glow)] transition-all duration-200"
		aria-label="Demo dashboard"
	>f</a>

	<nav class="flex flex-col items-center gap-1 flex-1">
		<Tooltip label="Dashboard" position="right">
			{#snippet children()}
				<a
					href="/demo"
					class="w-10 h-10 flex items-center justify-center rounded-xl
						text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5
						transition-all duration-150"
					aria-label="Dashboard"
				>
					<LayoutDashboard size={18} strokeWidth={1.75} />
				</a>
			{/snippet}
		</Tooltip>
	</nav>
</aside>

<!--
	Demo topbar — fixed top-10, left-16, height 3.5rem
-->
<header
	class="fixed top-10 left-16 right-0 h-14 z-30 flex items-center px-4 gap-4
		bg-[color-mix(in_srgb,var(--color-surface-1)_85%,transparent)]
		backdrop-blur-xl border-b border-[var(--color-border)]"
>
	<nav class="flex items-center gap-1.5 text-sm flex-1 font-[var(--font-ui)]">
		<a href="/demo" class="text-[var(--color-muted)] hover:text-[var(--color-electric)] transition-colors">
			forge demo
		</a>
		<span class="text-[var(--color-muted)] text-xs">›</span>
		<span class="text-[var(--color-text)]">{project?.name ?? 'project'}</span>
	</nav>

	<a
		href="/signup"
		class="flex items-center h-8 px-3 rounded-lg bg-[var(--color-accent)] text-[#05050a]
			font-[var(--font-display)] font-semibold text-xs
			hover:bg-white hover:shadow-[0_0_20px_rgba(226,232,240,0.2)] transition-all duration-150"
	>
		sign up free →
	</a>
</header>

<!--
	Demo tab bar — fixed below topbar (top-10 + 3.5rem = calc(2.5rem + 3.5rem))
-->
<nav
	class="fixed left-16 right-0 z-20 h-12 flex items-center gap-1 px-4
		bg-[color-mix(in_srgb,var(--color-surface-1)_85%,transparent)]
		backdrop-blur-xl border-b border-[var(--color-border)]"
	style="top: calc(2.5rem + 3.5rem);"
	aria-label="Project views"
>
	{#each tabs as tab}
		{@const active = activeTab === tab.view}
		<a
			href="/demo/project/{projectId}/{tab.view}"
			class="
				relative flex items-center gap-2 px-3 h-8 rounded-lg text-sm
				transition-all duration-150 font-[var(--font-ui)]
				{active
					? 'text-[var(--color-electric)] bg-[var(--color-electric-dim)]'
					: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
				}
			"
			aria-current={active ? 'page' : undefined}
		>
			<tab.icon size={14} strokeWidth={active ? 2 : 1.75} />
			{tab.label}
			{#if active}
				<span class="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--color-electric)]"></span>
			{/if}
		</a>
	{/each}
</nav>

<!--
	Content: ml-16 (sidebar) + pt = banner(2.5rem) + topbar(3.5rem) + tabbar(3rem) = 9rem
-->
<div class="ml-16 min-h-[calc(100vh-2.5rem)] bg-[var(--color-bg)]" style="padding-top: 9rem;">
	{@render children()}
</div>
