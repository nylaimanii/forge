<script lang="ts">
  import { goto } from '$app/navigation';
  import { demoData } from '$lib/stores/demo';
  import { showToast } from '$lib/stores/toasts';
  import { Plus, Database, ChevronRight } from 'lucide-svelte';

  let projects = $derived($demoData.projects);

  function addProject() {
    const id = `demo-${Date.now()}`;
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

<div style="padding: 48px 40px; max-width: 1100px;">
  <!-- header -->
  <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:40px; gap:16px; flex-wrap:wrap;">
    <div>
      <h1 style="font-family:var(--font-display); font-weight:700; font-size:28px; color:var(--color-text); margin-bottom:8px;">
        demo workspace
      </h1>
      <p style="color:var(--color-muted); font-family:var(--font-ui); font-size:14px; line-height:1.6;">
        explore forge with sample data — nothing saves to the database.<br>
        click any project to try schema builder, SQL, AI, visualize, and whiteboard.
      </p>
    </div>
    <button
      onclick={addProject}
      style="display:flex; align-items:center; gap:8px; height:44px; padding:0 20px; border-radius:10px; background:var(--color-accent); color:#05050a; font-family:var(--font-display); font-weight:600; font-size:14px; white-space:nowrap; cursor:pointer; border:none; flex-shrink:0;"
    >
      <Plus size={16} />
      new project
    </button>
  </div>

  <!-- project grid -->
  <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
    {#each projects as project}
      <button
        onclick={() => goto(`/demo/project/${project.id}/schema`)}
        style="text-align:left; padding:24px; border-radius:20px; border:1px solid rgba(255,255,255,0.06); background:var(--color-surface-1); cursor:pointer; transition:all 0.2s; width:100%;"
        onmouseenter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 40px rgba(79,142,247,0.25)'; }}
        onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
      >
        <!-- icon row -->
        <div style="display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:20px;">
          <div style="width:52px; height:52px; border-radius:14px; display:flex; align-items:center; justify-content:center; background:{project.color}; color:white; font-family:var(--font-display); font-weight:700; font-size:22px; flex-shrink:0;">
            {project.name.slice(0, 1)}
          </div>
          <ChevronRight size={18} style="color:var(--color-muted); margin-top:4px;" />
        </div>

        <!-- name -->
        <h2 style="font-family:var(--font-display); font-weight:600; color:var(--color-text); font-size:18px; margin-bottom:8px;">
          {project.name}
        </h2>

        <!-- meta -->
        <p style="color:var(--color-muted); font-family:var(--font-ui); font-size:13px; display:flex; align-items:center; gap:6px;">
          <Database size={12} />
          demo project · click to explore
        </p>

        <!-- view pills -->
        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:16px;">
          {#each ['schema', 'SQL', 'AI', 'visualize', 'whiteboard'] as view}
            <span style="padding:3px 10px; border-radius:999px; background:rgba(79,142,247,0.1); border:1px solid rgba(79,142,247,0.2); color:var(--color-electric); font-family:var(--font-body); font-size:10px;">
              {view}
            </span>
          {/each}
        </div>
      </button>
    {/each}
  </div>
</div>
