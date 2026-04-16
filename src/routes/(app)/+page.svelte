<script lang="ts">
	import type { PageData } from './$types';
	import { FolderPlus, Plus } from 'lucide-svelte';
	import ProjectCard from '$components/layout/ProjectCard.svelte';
	import Button from '$components/ui/Button.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { showToast } from '$lib/stores/toasts';

	let { data }: { data: PageData } = $props();

	// stub: real create flow comes next step
	function handleNewProject() {
		showToast('project creation coming next step', 'info');
	}
</script>

<svelte:head>
	<title>Dashboard — Forge</title>
</svelte:head>

<!-- subtle gradient mesh, fixed behind content -->
<div class="fixed inset-0 left-16 top-14 gradient-mesh opacity-30 pointer-events-none"></div>

<div class="relative z-10 px-8 py-10 max-w-6xl mx-auto">

	<!-- page header -->
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-2xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">
			your projects
		</h1>

		<Button variant="primary" size="sm" onclick={handleNewProject}>
			{#snippet icon()}
				<Plus size={14} />
			{/snippet}
			{#snippet children()}
				New project
			{/snippet}
		</Button>
	</div>

	<!-- project grid or empty state -->
	{#if data.projects.length === 0}
		<EmptyState
			title="no projects yet"
			description="create your first project to start building your database"
		>
			{#snippet icon()}
				<FolderPlus size={40} strokeWidth={1.25} />
			{/snippet}
			{#snippet cta()}
				<Button variant="primary" size="md" onclick={handleNewProject}>
					{#snippet icon()}
						<Plus size={14} />
					{/snippet}
					{#snippet children()}
						New project
					{/snippet}
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.projects as project, i (project.id)}
				<ProjectCard
					id={project.id}
					name={project.name}
					color={project.color ?? '#6c63ff'}
					updatedAt={project.updated_at}
					index={i}
				/>
			{/each}
		</div>
	{/if}
</div>
