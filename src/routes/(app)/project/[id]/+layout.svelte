<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import type { LayoutData } from './$types';
	import { Database, Code, Sparkles, Image, PenLine } from 'lucide-svelte';
	import { activeProject, breadcrumbs } from '$lib/stores';

	let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	// tab definitions — order matches the sidebar nav
	const tabs = [
		{ label: 'Schema',     view: 'schema',     icon: Database,  href: (id: string) => `/project/${id}/schema`     },
		{ label: 'SQL',        view: 'sql',         icon: Code,      href: (id: string) => `/project/${id}/sql`        },
		{ label: 'AI',         view: 'ai',          icon: Sparkles,  href: (id: string) => `/project/${id}/ai`         },
		{ label: 'Visualize',  view: 'visualize',   icon: Image,     href: (id: string) => `/project/${id}/visualize`  },
		{ label: 'Whiteboard', view: 'whiteboard',  icon: PenLine,   href: (id: string) => `/project/${id}/whiteboard` },
	];

	// derive the active tab from the current URL segment
	let activeTab = $derived(
		tabs.find((t) => $page.url.pathname.includes(`/${t.view}`))?.view ?? 'schema'
	);

	// derive the active tab label for breadcrumbs
	let activeLabel = $derived(
		tabs.find((t) => t.view === activeTab)?.label ?? 'Schema'
	);

	onMount(() => {
		// set the active project so the sidebar can highlight correctly
		activeProject.set({ id: data.project.id, name: data.project.name });

		// feed breadcrumbs up to the shared TopBar via the store
		breadcrumbs.set([
			{ label: data.project.name, href: `/project/${data.project.id}/schema` },
			{ label: activeLabel },
		]);
	});

	onDestroy(() => {
		// clear when leaving a project so the dashboard has no stale crumbs
		activeProject.set(null);
		breadcrumbs.set([]);
	});

	// keep breadcrumb label in sync as the active tab changes
	$effect(() => {
		breadcrumbs.set([
			{ label: data.project.name, href: `/project/${data.project.id}/schema` },
			{ label: activeLabel },
		]);
	});
</script>

<!--
	secondary tab bar — fixed, sits directly below the TopBar (top: 3.5rem = 56px).
	left-16 to clear the sidebar, z-20 so it's below TopBar (z-30) but above content.
-->
<nav
	class="
		fixed top-14 left-16 right-0 h-12 z-20
		flex items-center gap-1 px-4
		bg-[color-mix(in_srgb,var(--color-surface-1)_85%,transparent)]
		backdrop-blur-xl border-b border-[var(--color-border)]
	"
	aria-label="Project views"
>
	{#each tabs as tab}
		{@const active = activeTab === tab.view}
		<a
			href={tab.href(data.project.id)}
			class="
				relative flex items-center gap-2 px-3 h-8 rounded-lg text-sm transition-all duration-150 font-[var(--font-ui)]
				{active
					? 'text-white bg-[var(--color-accent-glow)]'
					: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
				}
			"
			aria-current={active ? 'page' : undefined}
		>
			<tab.icon size={14} strokeWidth={active ? 2 : 1.75} />
			{tab.label}

			<!-- active underline accent -->
			{#if active}
				<span class="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--color-accent)]"></span>
			{/if}
		</a>
	{/each}
</nav>

<!--
	content area — pushed down past both the TopBar (3.5rem) and the tab bar (3rem).
	The parent (app)/+layout.svelte already applies ml-16 mt-14 on <main>,
	so here we only need to add the tab-bar offset via padding.
-->
<div class="pt-12 min-h-full">
	{@render children()}
</div>
