<script lang="ts">
	import { goto } from '$app/navigation';
	import { demoData } from '$lib/stores/demo';
	import { showToast } from '$lib/stores/toasts';
	import { Plus, Database, ChevronRight } from 'lucide-svelte';

	let projects = $derived($demoData.projects);

	function addProject() {
		const id   = `demo-${Date.now()}`;
		const name = `Project ${$demoData.projects.length + 1}`;
		demoData.update((d) => ({
			...d,
			projects: [...d.projects, { id, name, color: '#4f8ef7' }],
		}));
		showToast('sign up to save your projects permanently', 'info');
	}
</script>

<svelte:head>
	<title>Demo — Forge</title>
</svelte:head>

<div class="min-h-[calc(100vh-2.5rem)] bg-[var(--color-bg)] p-8">
	<!-- header -->
	<div class="flex items-center justify-between mb-8 max-w-5xl">
		<div>
			<h1 class="font-[var(--font-display)] font-bold text-2xl text-[var(--color-text)]">demo workspace</h1>
			<p class="text-[var(--color-muted)] font-[var(--font-ui)] text-sm mt-1">
				explore forge with sample data — nothing saves to the database
			</p>
		</div>
		<button
			onclick={addProject}
			class="flex items-center gap-2 h-9 px-4 rounded-lg bg-[var(--color-accent)] text-[#05050a] font-[var(--font-display)] font-semibold text-sm hover:bg-white transition-all duration-150"
		>
			<Plus size={14} />
			new project
		</button>
	</div>

	<!-- project grid -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
		{#each projects as project}
			<button
				onclick={() => goto(`/demo/project/${project.id}/schema`)}
				class="group text-left p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] hover:border-[var(--color-border-active)] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_var(--color-electric-glow)] transition-all duration-200"
			>
				<div class="flex items-start justify-between mb-4">
					<div
						class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold font-[var(--font-display)] text-lg"
						style="background-color: {project.color};"
					>
						{project.name.slice(0, 1)}
					</div>
					<ChevronRight
						size={16}
						class="text-[var(--color-muted)] group-hover:text-[var(--color-electric)] transition-colors mt-1"
					/>
				</div>
				<h2 class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-base mb-1">
					{project.name}
				</h2>
				<p class="text-[var(--color-muted)] font-[var(--font-ui)] text-xs flex items-center gap-1.5">
					<Database size={11} />
					demo project · click to explore
				</p>
			</button>
		{/each}
	</div>
</div>
