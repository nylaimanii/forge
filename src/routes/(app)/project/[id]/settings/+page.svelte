<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { Download, Trash2, AlertTriangle } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import { showToast } from '$lib/stores/toasts';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();

	// ── project details state ─────────────────────────────────────────────────
	const COLOR_PRESETS = [
		'#6c63ff', '#00f5d4', '#ff4d6d', '#ffb84d', '#7dd87d', '#b784ff',
	];

	let name  = $state(data.project.name);
	let color = $state(data.project.color ?? COLOR_PRESETS[0]);

	// ── danger zone: delete confirmation ─────────────────────────────────────
	let confirmInput = $state('');
	let showConfirm  = $state(false);
	let canDelete    = $derived(confirmInput === data.project.name);

	// ── schema SQL export ─────────────────────────────────────────────────────
	const PG_TYPE: Record<string, string> = {
		text: 'text', integer: 'integer', bigint: 'bigint', float: 'double precision',
		boolean: 'boolean', uuid: 'uuid', timestamptz: 'timestamptz', jsonb: 'jsonb',
	};

	function ident(n: string): string {
		return /^[a-z_][a-z0-9_]*$/i.test(n) ? n : `"${n}"`;
	}

	function generateSchemaSQL(): string {
		const tables = data.schemaTables ?? [];
		if (tables.length === 0) return '-- no tables defined';
		const lines: string[] = [];
		for (const table of tables) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const sorted = [...(table.fields as any[])].sort((a, b) => a.position - b.position);
			lines.push(`create table if not exists ${ident(table.name)} (`);
			const cols = sorted.map((f) => {
				const pg  = PG_TYPE[f.type] ?? f.type;
				const pk  = f.is_primary ? ' primary key' : '';
				const nul = !f.is_primary && f.is_nullable ? '' : ' not null';
				return `  ${ident(f.name)} ${pg}${pk}${nul}`;
			});
			lines.push(cols.join(',\n'));
			lines.push(`);\n`);
		}
		return lines.join('\n');
	}

	function exportSchemaSQL() {
		const sql  = generateSchemaSQL();
		const blob = new Blob([sql], { type: 'text/plain' });
		const url  = URL.createObjectURL(blob);
		const a    = document.createElement('a');
		a.href     = url;
		a.download = `${data.project.name.replace(/\s+/g, '_')}_schema.sql`;
		a.click();
		URL.revokeObjectURL(url);
		showToast('schema SQL downloaded', 'success');
	}

	// show success toast when settings saved
	$effect(() => {
		if (actionData?.success) showToast('settings saved', 'success');
	});
</script>

<div class="py-10 px-6 max-w-2xl mx-auto">

	<!-- ── SECTION: Project Details ─────────────────────────────────────────── -->
	<section class="mb-10">
		<h2 class="text-base font-bold font-[var(--font-display)] text-[var(--color-text)] mb-5">project details</h2>

		<form method="POST" action="?/saveSettings" use:enhance class="flex flex-col gap-5">
			<!-- name -->
			<div>
				<label class="block text-xs font-[var(--font-ui)] text-[var(--color-muted)] uppercase tracking-wide mb-1.5" for="proj-name">name</label>
				<input
					id="proj-name"
					name="name"
					type="text"
					bind:value={name}
					class="w-full bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
				/>
			</div>

			<!-- color picker -->
			<div>
				<p class="text-xs font-[var(--font-ui)] text-[var(--color-muted)] uppercase tracking-wide mb-2">color</p>
				<input type="hidden" name="color" value={color} />
				<div class="flex items-center gap-2.5">
					{#each COLOR_PRESETS as preset}
						<button
							type="button"
							onclick={() => (color = preset)}
							style="background:{preset}; box-shadow: 0 0 8px {preset}60"
							class="w-7 h-7 rounded-full transition-all hover:scale-110 {color === preset ? 'ring-2 ring-offset-2 ring-offset-[var(--color-surface-1)] ring-[var(--color-accent)] scale-110' : ''}"
							aria-label="color {preset}"
							aria-pressed={color === preset}
						></button>
					{/each}
				</div>
			</div>

			{#if actionData?.error}
				<p class="text-xs text-[var(--color-danger)] font-[var(--font-ui)]">{actionData.error}</p>
			{/if}

			<div>
				<Button type="submit" variant="primary" size="sm">
					{#snippet children()}save settings{/snippet}
				</Button>
			</div>
		</form>
	</section>

	<div class="border-t border-[var(--color-border)] mb-10"></div>

	<!-- ── SECTION: Export ───────────────────────────────────────────────────── -->
	<section class="mb-10">
		<h2 class="text-base font-bold font-[var(--font-display)] text-[var(--color-text)] mb-2">export</h2>
		<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] mb-4">download your schema as a SQL file.</p>
		<Button variant="secondary" size="sm" onclick={exportSchemaSQL}>
			{#snippet icon()}<Download size={13} />{/snippet}
			{#snippet children()}export schema as SQL{/snippet}
		</Button>
	</section>

	<div class="border-t border-[var(--color-border)] mb-10"></div>

	<!-- ── SECTION: Danger Zone ──────────────────────────────────────────────── -->
	<section class="border border-[var(--color-danger)]/30 rounded-xl p-5">
		<div class="flex items-center gap-2 mb-3">
			<AlertTriangle size={16} class="text-[var(--color-danger)]" />
			<h2 class="text-base font-bold font-[var(--font-display)] text-[var(--color-danger)]">danger zone</h2>
		</div>
		<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] mb-4">
			deleting this project is permanent. all tables, queries, forms, and scripts will be removed.
		</p>

		{#if !showConfirm}
			<Button variant="danger" size="sm" onclick={() => (showConfirm = true)}>
				{#snippet icon()}<Trash2 size={13} />{/snippet}
				{#snippet children()}delete project{/snippet}
			</Button>
		{:else}
			<form method="POST" action="?/deleteProject" use:enhance class="flex flex-col gap-3">
				<p class="text-xs font-[var(--font-ui)] text-[var(--color-muted)]">
					type <span class="font-bold text-[var(--color-text)]">{data.project.name}</span> to confirm
				</p>
				<input
					type="text"
					name="confirm"
					bind:value={confirmInput}
					placeholder={data.project.name}
					class="w-full bg-[var(--color-surface-1)] border border-[var(--color-danger)]/30 rounded-lg px-3 py-2 text-sm font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-danger)] transition-colors"
				/>
				<div class="flex items-center gap-2">
					<Button type="submit" variant="danger" size="sm" disabled={!canDelete}>
						{#snippet children()}confirm delete{/snippet}
					</Button>
					<Button type="button" variant="ghost" size="sm" onclick={() => { showConfirm = false; confirmInput = ''; }}>
						{#snippet children()}cancel{/snippet}
					</Button>
				</div>
			</form>
		{/if}
	</section>
</div>
