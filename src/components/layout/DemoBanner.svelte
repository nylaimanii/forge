<script lang="ts">
  import { goto } from '$app/navigation';
  import { isDemoMode } from '$lib/stores/demo';
  import { X } from 'lucide-svelte';
</script>

<div style="position:fixed; top:0; left:0; right:0; height:40px; z-index:50; display:flex; align-items:center; justify-content:space-between; padding:0 16px; background:#4f8ef7; color:white; font-size:12px; font-family:var(--font-ui);">
  <!-- exit -->
  <button
    onclick={() => { isDemoMode.set(false); goto('/'); }}
    style="display:flex; align-items:center; gap:6px; opacity:0.85; cursor:pointer; background:none; border:none; color:white; font-size:12px; font-family:var(--font-ui); white-space:nowrap; flex-shrink:0;"
  >
    <X size={13} />
    exit demo
  </button>

  <!-- center label -->
  <span style="position:absolute; left:50%; transform:translateX(-50%); white-space:nowrap; opacity:0.95; font-size:12px;">
    you're in demo mode — nothing saves to the database
  </span>

  <!-- sign up CTA -->
  <a
    href="/signup"
    style="display:inline-flex; align-items:center; height:26px; padding:0 12px; border-radius:6px; background:white; color:#4f8ef7; font-weight:700; font-size:11px; font-family:var(--font-display); text-decoration:none; white-space:nowrap; flex-shrink:0;"
  >
    sign up free →
  </a>
</div>
