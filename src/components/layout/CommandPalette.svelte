<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { Search, LayoutDashboard, Database, Code, Sparkles, Image, PenLine, Plus, LogOut, Keyboard, FormInput, Zap } from 'lucide-svelte';
	import { activeProject } from '$lib/stores';
	import { showToast } from '$lib/stores/toasts';
	import { createBrowserSupabase } from '$lib/supabase';

	interface Props {
		open:     boolean;
		onclose?: () => void;
	}

	let { open = $bindable(false), onclose }: Props = $props();

	let query      = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	// ── navigate to a project view (with fallback if no project is open) ──────
	function toProjectView(view: string) {
		const proj = get(activeProject);
		if (proj?.id) {
			goto(`/project/${proj.id}/${view}`);
		} else {
			showToast('open a project first', 'info');
			goto('/dashboard');
		}
	}

	// ── all palette actions ───────────────────────────────────────────────────
	const allActions = [
		{
			icon: LayoutDashboard,
			label: 'Go to Dashboard',
			shortcut: 'G D',
			action: () => goto('/dashboard'),
		},
		{
			icon: Database,
			label: 'Go to Schema',
			shortcut: 'G S',
			action: () => toProjectView('schema'),
		},
		{
			icon: Code,
			label: 'Open SQL Editor',
			shortcut: 'G Q',
			action: () => toProjectView('sql'),
		},
		{
			icon: Sparkles,
			label: 'Open AI Mode',
			shortcut: 'G A',
			action: () => toProjectView('ai'),
		},
		{
			icon: Image,
			label: 'Go to Visualize',
			shortcut: 'G V',
			action: () => toProjectView('visualize'),
		},
		{
			icon: PenLine,
			label: 'Open Whiteboard',
			shortcut: 'G W',
			action: () => toProjectView('whiteboard'),
		},
		{
			icon: FormInput,
			label: 'Go to Forms',
			shortcut: 'G F',
			action: () => toProjectView('forms'),
		},
		{
			icon: Zap,
			label: 'Go to Scripts',
			shortcut: 'G R',
			action: () => toProjectView('scripts'),
		},
		{
			icon: Plus,
			label: 'New Project',
			shortcut: '⌘N',
			action: () => {
				showToast('use the dashboard to create a project', 'info');
				goto('/dashboard');
			},
		},
		{
			icon: Keyboard,
			label: 'Keyboard Shortcuts',
			shortcut: '?',
			action: () => {
				// dispatch a custom event that the layout catches via onclose
				window.dispatchEvent(new CustomEvent('forge:shortcuts'));
			},
		},
		{
			icon: LogOut,
			label: 'Sign Out',
			shortcut: '',
			action: async () => {
				const supabase = createBrowserSupabase();
				await supabase.auth.signOut();
				goto('/');
			},
		},
	];

	// filter by query
	let filtered = $derived(
		query.trim()
			? allActions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
			: allActions
	);

	let selectedIdx = $state(0);

	// reset state when opened
	$effect(() => {
		if (open) {
			query = '';
			selectedIdx = 0;
			setTimeout(() => inputEl?.focus(), 50);
		}
	});

	function close() {
		onclose?.();
	}

	function handleKey(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') { close(); return; }
		if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, filtered.length - 1); }
		if (e.key === 'ArrowUp')   { e.preventDefault(); selectedIdx = Math.max(selectedIdx - 1, 0); }
		if (e.key === 'Enter')     { e.preventDefault(); runAction(selectedIdx); }
	}

	function runAction(idx: number) {
		filtered[idx]?.action();
		close();
	}

	function handleWindow(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			if (open) close();
			return;
		}
		handleKey(e);
	}
</script>

<svelte:window onkeydown={handleWindow} />

{#if open}
	<!-- backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4 bg-black/60 backdrop-blur-sm"
		onclick={(e) => { if (e.target === e.currentTarget) close(); }}
		transition:fade={{ duration: 120 }}
	>
		<!-- panel -->
		<div
			class="glass w-full max-w-lg rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
			transition:fly={{ y: -8, duration: 180 }}
		>
			<!-- search input -->
			<div class="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
				<Search size={16} class="text-[var(--color-muted)] shrink-0" />
				<input
					bind:this={inputEl}
					bind:value={query}
					placeholder="Search commands, views, projects..."
					class="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none font-[var(--font-ui)]"
				/>
				<kbd class="text-[10px] text-[var(--color-muted)] bg-white/5 border border-[var(--color-border)] rounded px-1.5 py-0.5 font-[var(--font-body)]">esc</kbd>
			</div>

			<!-- action list -->
			<ul class="py-2 max-h-80 overflow-y-auto">
				{#each filtered as action, i}
					<li>
						<button
							onclick={() => runAction(i)}
							onmouseenter={() => (selectedIdx = i)}
							class="
								w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
								font-[var(--font-ui)] text-left
								{selectedIdx === i
									? 'bg-[var(--color-accent-glow)] text-[var(--color-text)]'
									: 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
								}
							"
						>
							<action.icon size={15} />
							<span class="flex-1">{action.label}</span>
							{#if action.shortcut}
								<kbd class="text-[10px] text-[var(--color-muted)] bg-white/5 border border-[var(--color-border)] rounded px-1.5 py-0.5 font-[var(--font-body)]">
									{action.shortcut}
								</kbd>
							{/if}
						</button>
					</li>
				{:else}
					<li class="px-4 py-6 text-center text-sm text-[var(--color-muted)] font-[var(--font-ui)]">
						No commands found for "{query}"
					</li>
				{/each}
			</ul>
		</div>
	</div>
{/if}
