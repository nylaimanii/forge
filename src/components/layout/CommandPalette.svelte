<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { Search, LayoutDashboard, Database, Code, Sparkles, Image, PenLine, Plus } from 'lucide-svelte';

	interface Props {
		open:     boolean;
		onclose?: () => void;
	}

	let { open = $bindable(false), onclose }: Props = $props();

	let query = $state('');
	let inputEl: HTMLInputElement | undefined = $state();

	// all palette actions
	const allActions = [
		{ icon: LayoutDashboard, label: 'Go to Dashboard',  shortcut: 'G D', action: () => goto('/') },
		{ icon: Database,        label: 'Go to Schema',      shortcut: 'G S', action: () => goto('/schema') },
		{ icon: Code,            label: 'Open SQL Editor',   shortcut: 'G Q', action: () => goto('/sql') },
		{ icon: Sparkles,        label: 'Open AI Mode',      shortcut: 'G A', action: () => goto('/ai') },
		{ icon: Image,           label: 'Go to Visualize',   shortcut: 'G V', action: () => goto('/visualize') },
		{ icon: PenLine,         label: 'Open Whiteboard',   shortcut: 'G W', action: () => goto('/whiteboard') },
		{ icon: Plus,            label: 'New Project',        shortcut: '⌘N', action: () => {} }, // placeholder
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
			// focus the input after the transition
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

	// combined keyboard handler: arrow nav + enter + escape + cmd+k
	function handleWindow(e: KeyboardEvent) {
		// cmd+k toggles the palette (parent also wires this, but handle here for safety)
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault();
			if (open) close();
			return;
		}
		// the rest only applies when the palette is open
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
							<kbd class="text-[10px] text-[var(--color-muted)] bg-white/5 border border-[var(--color-border)] rounded px-1.5 py-0.5 font-[var(--font-body)]">
								{action.shortcut}
							</kbd>
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
