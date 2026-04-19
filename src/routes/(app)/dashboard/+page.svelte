<script lang="ts">
	import type { PageData } from './$types';
	import { FolderPlus, Plus, Database, GitBranch } from 'lucide-svelte';
	import ProjectCard from '$components/layout/ProjectCard.svelte';
	import NewProjectModal from '$components/layout/NewProjectModal.svelte';
	import RenameProjectModal from '$components/layout/RenameProjectModal.svelte';
	import DeleteProjectModal from '$components/layout/DeleteProjectModal.svelte';
	import Button from '$components/ui/Button.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';

	let { data }: { data: PageData } = $props();

	let showNewProject = $state(false);
	let renaming: { id: string; name: string } | null = $state(null);
	let deleting: { id: string; name: string } | null = $state(null);

	// ── relative time ─────────────────────────────────────────────────────────
	function relativeTime(dateStr: string): string {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1)   return 'just now';
		if (mins < 60)  return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24)   return `${hrs}h ago`;
		const days = Math.floor(hrs / 24);
		if (days < 7)   return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Dashboard — Forge</title>
</svelte:head>

<div class="fixed inset-0 left-16 top-14 gradient-mesh opacity-30 pointer-events-none"></div>

<div class="relative z-10 px-8 py-10 max-w-6xl mx-auto">

	<!-- ── stats row ─────────────────────────────────────────────────────────── -->
	<div class="grid grid-cols-3 gap-4 mb-10">
		{#each [
			{ value: data.projects.length, label: 'projects' },
			{ value: data.totalTables,     label: 'tables'   },
			{ value: data.totalQueries,    label: 'queries run' },
		] as stat}
			<div class="glass border border-[var(--color-border)] rounded-xl p-5">
				<div class="font-[var(--font-display)] font-bold text-[var(--color-electric)] leading-none mb-1" style="font-size:2.5rem;">
					{stat.value}
				</div>
				<div class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">{stat.label}</div>
			</div>
		{/each}
	</div>

	<!-- ── page header ───────────────────────────────────────────────────────── -->
	<div class="flex items-center justify-between mb-8">
		<h1 class="text-2xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">
			your projects
		</h1>

		<Button variant="primary" size="sm" onclick={() => (showNewProject = true)}>
			{#snippet icon()}<Plus size={14} />{/snippet}
			{#snippet children()}New project{/snippet}
		</Button>
	</div>

	<!-- ── project grid or empty state ──────────────────────────────────────── -->
	{#if data.projects.length === 0}
		<EmptyState
			title="no projects yet"
			description="create your first project to start building your database"
		>
			{#snippet icon()}<FolderPlus size={40} strokeWidth={1.25} />{/snippet}
			{#snippet cta()}
				<Button variant="primary" size="md" onclick={() => (showNewProject = true)}>
					{#snippet icon()}<Plus size={14} />{/snippet}
					{#snippet children()}New project{/snippet}
				</Button>
			{/snippet}
		</EmptyState>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.projects as project, i (project.id)}
				<ProjectCard
					id={project.id}
					name={project.name}
					color={project.color ?? '#f59e0b'}
					updatedAt={project.updated_at}
					index={i}
					onrename={(p) => (renaming = p)}
					ondelete={(p) => (deleting = p)}
				/>
			{/each}
		</div>
	{/if}

	<!-- ── recent activity ───────────────────────────────────────────────────── -->
	{#if data.recentActivity && data.recentActivity.length > 0}
		<div class="mt-12">
			<h2 class="text-base font-bold font-[var(--font-display)] text-[var(--color-text)] mb-4">recent queries</h2>
			<div class="flex flex-col gap-2">
				{#each data.recentActivity as item}
					{@const projectId = item.project_id}
					{@const projectName = (Array.isArray(item.project) ? item.project[0]?.name : (item.project as { name?: string })?.name) ?? 'unknown project'}
					{@const truncatedSql = item.sql.length > 60 ? item.sql.slice(0, 60) + '…' : item.sql}
					<a
						href="/project/{projectId}/sql?sql={encodeURIComponent(item.sql)}"
						class="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] hover:border-[var(--color-border-active)] hover:bg-[var(--color-surface-2)] transition-all group"
					>
						<!-- project pill -->
						<span class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[10px] font-[var(--font-body)] text-[var(--color-muted)] shrink-0">
							<Database size={9} />
							{projectName}
						</span>
						<!-- SQL snippet -->
						<span class="flex-1 text-xs font-[var(--font-body)] text-[var(--color-muted)] group-hover:text-[var(--color-text)] truncate transition-colors">
							{truncatedSql}
						</span>
						<!-- relative time -->
						<span class="text-[10px] text-[var(--color-muted)] font-[var(--font-ui)] shrink-0">
							{relativeTime(item.ran_at)}
						</span>
					</a>
				{/each}
			</div>
		</div>
	{:else if data.projects.length > 0}
		<div class="mt-12">
			<h2 class="text-base font-bold font-[var(--font-display)] text-[var(--color-text)] mb-4">recent queries</h2>
			<div class="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)]">
				<GitBranch size={14} class="text-[var(--color-muted)]" />
				<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)]">
					no queries yet — run your first query in the <a href="/project/{data.projects[0]?.id}/sql" class="text-[var(--color-electric)] hover:underline">SQL editor</a>
				</p>
			</div>
		</div>
	{/if}
</div>

<!-- new project modal -->
<NewProjectModal
	bind:open={showNewProject}
	onclose={() => (showNewProject = false)}
/>

{#if renaming}
	<RenameProjectModal
		open={true}
		projectId={renaming.id}
		currentName={renaming.name}
		onclose={() => (renaming = null)}
	/>
{/if}

{#if deleting}
	<DeleteProjectModal
		open={true}
		projectId={deleting.id}
		projectName={deleting.name}
		onclose={() => (deleting = null)}
	/>
{/if}
