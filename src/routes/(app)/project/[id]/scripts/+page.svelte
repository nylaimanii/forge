<script lang="ts">
	import { enhance } from '$app/forms';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { Zap, Plus, Trash2, Play, ChevronDown } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { showToast } from '$lib/stores/toasts';

	let { data }: { data: PageData } = $props();

	// ── state ─────────────────────────────────────────────────────────────────
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let scripts = $state<any[]>([...data.scripts]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let selected = $state<any | null>(null);
	let running  = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let runResults = $state<any[] | null>(null);
	let runError  = $state('');

	const TRIGGER_TYPES = [
		{ value: 'manual',          label: 'manual' },
		{ value: 'on_form_submit',  label: 'on form submit' },
		{ value: 'on_row_insert',   label: 'on row insert' },
		{ value: 'daily',           label: 'daily' },
		{ value: 'weekly',          label: 'weekly' },
	];

	const ACTION_TYPES = [
		{ value: 'run_sql',       label: 'run SQL query'       },
		{ value: 'call_webhook',  label: 'call webhook URL'    },
		{ value: 'insert_row',    label: 'insert row'          },
		{ value: 'update_rows',   label: 'update rows'         },
		{ value: 'delete_rows',   label: 'delete rows'         },
	];

	// ── action helpers ────────────────────────────────────────────────────────
	function addAction() {
		if (!selected) return;
		selected = {
			...selected,
			actions: [...selected.actions, { id: crypto.randomUUID(), type: 'run_sql', sql: '' }],
		};
	}

	function removeAction(id: string) {
		if (!selected) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		selected = { ...selected, actions: selected.actions.filter((a: any) => a.id !== id) };
	}

	function updateAction(id: string, key: string, value: unknown) {
		if (!selected) return;
		selected = {
			...selected,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			actions: selected.actions.map((a: any) => a.id === id ? { ...a, [key]: value } : a),
		};
	}

	// ── save ──────────────────────────────────────────────────────────────────
	async function saveScript() {
		if (!selected) return;
		const body = new URLSearchParams({
			id:             selected.id,
			name:           selected.name,
			trigger_type:   selected.trigger_type,
			trigger_config: JSON.stringify(selected.trigger_config ?? {}),
			actions:        JSON.stringify(selected.actions),
		});
		const res = await fetch('?/saveScript', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		});
		if (res.ok) {
			showToast('script saved', 'success');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			scripts = scripts.map((s: any) => s.id === selected!.id ? { ...selected } : s);
		}
	}

	// ── run ───────────────────────────────────────────────────────────────────
	async function runScript() {
		if (!selected) return;
		running = true;
		runResults = null;
		runError = '';
		try {
			const body = new URLSearchParams({ id: selected.id });
			const res = await fetch('?/runScript', {
				method:  'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body,
			});
			const text = await res.text();
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const result = deserialize(text) as any;
			if (result?.type === 'success') {
				runResults = result.data?.results ?? [];
				showToast('script ran successfully', 'success');
			} else {
				runError = result?.data?.error ?? 'run failed';
				showToast(runError, 'error');
			}
		} finally {
			running = false;
		}
	}
</script>

<div class="flex overflow-hidden -mt-12" style="height: calc(100vh - 6.5rem);">

	<!-- ── LEFT SIDEBAR ────────────────────────────────────────────────────── -->
	<aside class="w-[220px] shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-y-auto">
		<div class="shrink-0 px-4 pt-5 pb-3 flex items-center justify-between">
			<h2 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)]">scripts</h2>
			<form method="POST" action="?/createScript" use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success' && result.data?.script) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const s = result.data.script as any;
						scripts = [s, ...scripts];
						selected = { ...s, actions: s.actions ?? [] };
					}
				};
			}}>
				<button type="submit" class="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--color-electric-dim)] text-[var(--color-electric)] hover:bg-[var(--color-electric)]/20 transition-colors" aria-label="New script">
					<Plus size={14} />
				</button>
			</form>
		</div>

		{#if scripts.length === 0}
			<p class="px-4 text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">no scripts yet</p>
		{:else}
			<div class="flex flex-col gap-0.5 px-2 pb-4">
				{#each scripts as script}
					{@const active = selected?.id === script.id}
					<button
						type="button"
						onclick={() => { selected = { ...script }; runResults = null; runError = ''; }}
						class="
							flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left
							text-xs font-[var(--font-body)] transition-all
							{active
								? 'border-l-2 border-[var(--color-electric)] bg-[var(--color-electric-dim)] text-[var(--color-text)] pl-[10px]'
								: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
							}
						"
					>
						<Zap size={11} class="shrink-0" />
						<span class="truncate">{script.name}</span>
					</button>
				{/each}
			</div>
		{/if}
	</aside>

	<!-- ── MAIN AREA ──────────────────────────────────────────────────────── -->
	<div class="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg)]">
		{#if !selected}
			<div class="flex items-center justify-center h-full">
				<EmptyState title="no script selected" description="create a script or select one from the left to start building">
					{#snippet icon()}<Zap size={36} strokeWidth={1.25} />{/snippet}
				</EmptyState>
			</div>
		{:else}
			<!-- toolbar -->
			<div class="shrink-0 flex items-center gap-3 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-1)]">
				<input
					type="text"
					bind:value={selected.name}
					class="flex-1 bg-transparent text-sm font-[var(--font-display)] font-semibold text-[var(--color-text)] outline-none border-b border-transparent focus:border-[var(--color-electric)] transition-colors"
				/>
				<Button variant="primary" size="sm" onclick={saveScript}>
					{#snippet children()}save{/snippet}
				</Button>
				<form method="POST" action="?/deleteScript" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							scripts = scripts.filter((s: any) => s.id !== selected!.id);
							selected = null;
						}
					};
				}}>
					<input type="hidden" name="id" value={selected.id} />
					<button type="submit" class="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors" aria-label="delete script">
						<Trash2 size={14} />
					</button>
				</form>
			</div>

			<div class="flex-1 overflow-y-auto p-6">
				<div class="max-w-2xl flex flex-col gap-6">

					<!-- trigger section -->
					<div class="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-4">
						<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] mb-3">trigger</p>
						<div class="flex items-center gap-2 mb-3">
							<ChevronDown size={13} class="text-[var(--color-muted)] shrink-0" />
							<select
								bind:value={selected.trigger_type}
								class="flex-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-[var(--font-ui)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
							>
								{#each TRIGGER_TYPES as tt}
									<option value={tt.value}>{tt.label}</option>
								{/each}
							</select>
						</div>

						<!-- secondary selector for context-sensitive triggers -->
						{#if selected.trigger_type === 'on_form_submit'}
							<div class="mt-2">
								<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">which form</label>
								<select
									bind:value={selected.trigger_config.form_id}
									class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-[var(--font-ui)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
								>
									<option value="">— select form —</option>
									{#each data.forms as f}
										<option value={f.id}>{f.title}</option>
									{/each}
								</select>
							</div>
						{:else if selected.trigger_type === 'on_row_insert'}
							<div class="mt-2">
								<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">which table</label>
								<select
									bind:value={selected.trigger_config.table_id}
									class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-[var(--font-ui)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
								>
									<option value="">— select table —</option>
									{#each data.tables as t}
										<option value={t.id}>{t.name}</option>
									{/each}
								</select>
							</div>
						{/if}

						<!-- run now button (only for manual trigger) -->
						{#if selected.trigger_type === 'manual'}
							<div class="mt-3">
								<Button variant="secondary" size="sm" onclick={runScript} disabled={running}>
									{#snippet icon()}<Play size={12} />{/snippet}
									{#snippet children()}{running ? 'running...' : 'run now'}{/snippet}
								</Button>
							</div>
						{/if}
					</div>

					<!-- action chain -->
					<div>
						<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] mb-3">actions</p>
						<div class="flex flex-col gap-3">
							{#each selected.actions as action, i}
								<div class="bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-4">
									<div class="flex items-center gap-2 mb-3">
										<span class="text-[10px] uppercase text-[var(--color-electric)] font-[var(--font-body)]">step {i + 1}</span>
										<div class="flex-1"></div>
										<button onclick={() => removeAction(action.id)} class="p-1 text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors" aria-label="remove action">
											<Trash2 size={13} />
										</button>
									</div>

									<!-- action type selector -->
									<div class="mb-3">
										<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">action type</label>
										<select
											value={action.type}
											onchange={(e) => updateAction(action.id, 'type', (e.target as HTMLSelectElement).value)}
											class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-[var(--font-ui)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
										>
											{#each ACTION_TYPES as at}
												<option value={at.value}>{at.label}</option>
											{/each}
										</select>
									</div>

									<!-- action-specific fields -->
									{#if action.type === 'run_sql'}
										<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">SQL</label>
										<textarea
											value={action.sql ?? ''}
											oninput={(e) => updateAction(action.id, 'sql', (e.target as HTMLTextAreaElement).value)}
											placeholder="SELECT * FROM my_table WHERE ..."
											class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] resize-none h-24 transition-colors"
										></textarea>

									{:else if action.type === 'call_webhook'}
										<div class="flex flex-col gap-2">
											<div>
												<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">URL</label>
												<input
													type="url"
													value={action.url ?? ''}
													oninput={(e) => updateAction(action.id, 'url', (e.target as HTMLInputElement).value)}
													placeholder="https://..."
													class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
												/>
											</div>
											<div>
												<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">method</label>
												<select
													value={action.method ?? 'POST'}
													onchange={(e) => updateAction(action.id, 'method', (e.target as HTMLSelectElement).value)}
													class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
												>
													<option>GET</option>
													<option>POST</option>
												</select>
											</div>
										</div>

									{:else if action.type === 'insert_row'}
										<div class="flex flex-col gap-2">
											<div>
												<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">table name</label>
												<input
													type="text"
													value={action.table ?? ''}
													oninput={(e) => updateAction(action.id, 'table', (e.target as HTMLInputElement).value)}
													placeholder="my_table"
													class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
												/>
											</div>
											<div>
												<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">row data (JSON)</label>
												<textarea
													value={action.template ?? '{}'}
													oninput={(e) => updateAction(action.id, 'template', (e.target as HTMLTextAreaElement).value)}
													placeholder={'{ "name": "value" }'}
													class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] resize-none h-20 transition-colors"
												></textarea>
											</div>
										</div>

									{:else if action.type === 'update_rows' || action.type === 'delete_rows'}
										<div class="flex flex-col gap-2">
											<div>
												<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">table name</label>
												<input
													type="text"
													value={action.table ?? ''}
													oninput={(e) => updateAction(action.id, 'table', (e.target as HTMLInputElement).value)}
													placeholder="my_table"
													class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
												/>
											</div>
											<div>
												<label class="block text-xs text-[var(--color-muted)] font-[var(--font-ui)] mb-1">WHERE condition</label>
												<input
													type="text"
													value={action.where ?? ''}
													oninput={(e) => updateAction(action.id, 'where', (e.target as HTMLInputElement).value)}
													placeholder="id = '123'"
													class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-xs font-[var(--font-body)] text-[var(--color-text)] outline-none focus:border-[var(--color-electric)] transition-colors"
												/>
											</div>
										</div>
									{/if}
								</div>
							{/each}

							<!-- add action button -->
							<button
								onclick={addAction}
								class="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-[var(--color-border)] text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-electric)] hover:border-[var(--color-electric)]/40 transition-colors"
							>
								<Plus size={14} /> add action
							</button>
						</div>
					</div>

					<!-- run output -->
					{#if runResults !== null || runError}
						<div class="bg-[var(--color-surface-1)] border {runError ? 'border-[var(--color-danger)]/30' : 'border-[var(--color-success)]/30'} rounded-xl p-4">
							<p class="text-[10px] uppercase tracking-widest font-[var(--font-ui)] mb-2 {runError ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}">
								{runError ? 'error' : 'output'}
							</p>
							{#if runError}
								<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{runError}</p>
							{:else}
								<pre class="text-xs font-[var(--font-body)] text-[var(--color-text)] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(runResults, null, 2)}</pre>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
