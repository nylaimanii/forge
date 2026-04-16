<script lang="ts">
	import { page } from '$app/stores';
	import Tooltip from '$components/ui/Tooltip.svelte';
	import {
		LayoutDashboard,
		Database,
		Code,
		Sparkles,
		Image,
		PenLine,
		Settings
	} from 'lucide-svelte';

	// nav items — icon + label + route
	const navItems = [
		{ icon: LayoutDashboard, label: 'Dashboard',   href: '/'           },
		{ icon: Database,        label: 'Schema',       href: '/schema'     },
		{ icon: Code,            label: 'SQL Editor',   href: '/sql'        },
		{ icon: Sparkles,        label: 'AI Mode',      href: '/ai'         },
		{ icon: Image,           label: 'Visualize',    href: '/visualize'  },
		{ icon: PenLine,         label: 'Whiteboard',   href: '/whiteboard' },
	];

	// active route detection
	let currentPath = $derived($page.url.pathname);

	function isActive(href: string) {
		if (href === '/') return currentPath === '/';
		return currentPath.startsWith(href);
	}
</script>

<aside class="fixed left-0 top-0 h-screen w-16 z-40 flex flex-col items-center py-4 border-r border-[var(--color-border)] bg-[var(--color-surface-1)]">

	<!-- forge logo mark -->
	<a
		href="/"
		class="w-9 h-9 mb-6 flex items-center justify-center rounded-xl bg-[var(--color-accent)] text-white font-[var(--font-display)] font-bold text-lg hover:shadow-[0_0_24px_var(--color-accent-glow)] transition-all duration-200"
		aria-label="Forge home"
	>
		f
	</a>

	<!-- nav icons -->
	<nav class="flex flex-col items-center gap-1 flex-1">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			<Tooltip label={item.label} position="right">
				{#snippet children()}
					<a
						href={item.href}
						class="
							relative w-10 h-10 flex items-center justify-center rounded-xl
							transition-all duration-150 group
							{active
								? 'text-[var(--color-accent)] bg-[var(--color-accent-glow)]'
								: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
							}
						"
						aria-label={item.label}
					>
						<!-- active left-border indicator -->
						{#if active}
							<span class="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]"></span>
						{/if}
						<item.icon size={18} strokeWidth={active ? 2 : 1.75} />
					</a>
				{/snippet}
			</Tooltip>
		{/each}
	</nav>

	<!-- settings pinned to bottom -->
	<Tooltip label="Settings" position="right">
		{#snippet children()}
			<a
				href="/settings"
				class="
					w-10 h-10 flex items-center justify-center rounded-xl
					text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5
					transition-all duration-150
				"
				aria-label="Settings"
			>
				<Settings size={18} strokeWidth={1.75} />
			</a>
		{/snippet}
	</Tooltip>
</aside>
