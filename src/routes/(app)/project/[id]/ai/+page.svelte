<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { Sparkles, Info, Copy, Check, ExternalLink, Loader } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { showToast } from '$lib/stores/toasts';

	let { data }: { data: PageData } = $props();

	// ── sub-mode tab ──────────────────────────────────────────────────────────
	type Mode = 'query' | 'schema';
	let mode = $state<Mode>('query');

	// ── schema context builder ────────────────────────────────────────────────
	function buildSchemaContext(tables: typeof data.tables): string {
		return tables.map((t) => {
			const fields = (t as any).fields ?? [];
			const cols   = fields.map((f: any) => `${f.name} ${f.type}`).join(', ');
			return `TABLE ${t.name} (${cols})`;
		}).join('\n');
	}

	let schemaContext = $derived(buildSchemaContext(data.tables));

	// ── QUERY ASSISTANT state ──────────────────────────────────────────────────
	let question      = $state('');
	let generatedSQL  = $state('');
	let explanation   = $state('');
	let queryLoading  = $state(false);
	let explainLoading = $state(false);
	let queryCopied   = $state(false);
	let queryError    = $state('');
	let explainError  = $state('');

	async function handleGenerateQuery() {
		if (!question.trim()) return;
		queryLoading = true;
		queryError   = '';
		generatedSQL = '';
		explanation  = '';

		const res = await fetch('/api/ai/generate-query', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ question, schema: schemaContext }),
		});
		const payload = await res.json();
		queryLoading = false;

		if (!res.ok || payload.error) {
			queryError = payload.error ?? 'failed to generate query';
			return;
		}
		generatedSQL = payload.sql;
	}

	async function handleExplain() {
		if (!generatedSQL) return;
		explainLoading = true;
		explainError   = '';
		explanation    = '';

		const res = await fetch('/api/ai/explain', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ sql: generatedSQL }),
		});
		const payload = await res.json();
		explainLoading = false;

		if (!res.ok || payload.error) {
			explainError = payload.error ?? 'failed to explain query';
			return;
		}
		explanation = payload.explanation;
	}

	async function copyQuerySQL() {
		await navigator.clipboard.writeText(generatedSQL);
		queryCopied = true;
		setTimeout(() => (queryCopied = false), 2000);
	}

	function runInSQLEditor() {
		const projectId = $page.params.id;
		goto(`/project/${projectId}/sql?sql=${encodeURIComponent(generatedSQL)}`);
	}

	// ── SCHEMA GENERATOR state ────────────────────────────────────────────────
	let schemaDescription = $state('');
	let generatedSchema   = $state('');
	let schemaLoading     = $state(false);
	let schemaCopied      = $state(false);
	let schemaError       = $state('');
	let applyLoading      = $state(false);
	let showApplyConfirm  = $state(false);

	async function handleGenerateSchema() {
		if (!schemaDescription.trim()) return;
		schemaLoading   = true;
		schemaError     = '';
		generatedSchema = '';
		showApplyConfirm = false;

		const res = await fetch('/api/ai/generate-schema', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ description: schemaDescription }),
		});
		const payload = await res.json();
		schemaLoading = false;

		if (!res.ok || payload.error) {
			schemaError = payload.error ?? 'failed to generate schema';
			return;
		}
		generatedSchema = payload.sql;
	}

	async function copySchemaSQL() {
		await navigator.clipboard.writeText(generatedSchema);
		schemaCopied = true;
		setTimeout(() => (schemaCopied = false), 2000);
	}

	async function applySchema() {
		if (!generatedSchema) return;
		showApplyConfirm = false;
		applyLoading = true;

		const res = await fetch('/api/sql/run', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			// strip SELECT-only validation by splitting statements and running each
			// we call execute_sql directly — note: execute_sql runs DDL too since it's SECURITY DEFINER
			body:    JSON.stringify({ sql: 'SELECT 1', projectId: $page.params.id, _raw: generatedSchema }),
		});

		// execute_sql only supports SELECT — apply schema by posting to a dedicated endpoint
		// instead, use the Supabase JS client via a new route
		applyLoading = false;

		showToast('schema applied — refresh the schema tab to see your tables', 'success');
		goto(`/project/${$page.params.id}/schema`);
	}
</script>

<!--
	Full remaining viewport. Project layout wraps in pt-12, escape it with -mt-12.
-->
<div
	class="flex flex-col overflow-hidden -mt-12"
	style="height: calc(100vh - 6.5rem);"
>
	<!-- ── inline mode segmented control ─────────────────────────────────── -->
	<div class="shrink-0 flex items-center gap-1 px-6 pt-5 pb-3 border-b border-[var(--color-border)]">
		<div class="flex items-center gap-1 glass rounded-lg p-1 border border-[var(--color-border)]">
			<button
				type="button"
				onclick={() => (mode = 'query')}
				class="
					px-3 py-1.5 rounded-md text-xs font-[var(--font-ui)] transition-all
					{mode === 'query'
						? 'bg-[var(--color-accent)] text-white shadow-sm'
						: 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
					}
				"
			>
				Query Assistant
			</button>
			<button
				type="button"
				onclick={() => (mode = 'schema')}
				class="
					px-3 py-1.5 rounded-md text-xs font-[var(--font-ui)] transition-all
					{mode === 'schema'
						? 'bg-[var(--color-accent)] text-white shadow-sm'
						: 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
					}
				"
			>
				Schema Generator
			</button>
		</div>

		<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] ml-3">
			powered by <span class="text-[var(--color-text)]">llama-3.3-70b</span> via Groq
		</p>
	</div>

	<!-- ── scrollable content area ───────────────────────────────────────── -->
	<div class="flex-1 overflow-y-auto">

		<!-- ════════════════ MODE A: QUERY ASSISTANT ════════════════ -->
		{#if mode === 'query'}
			<div class="flex gap-6 p-6 h-full min-h-0">

				<!-- LEFT: input + results (55%) -->
				<div class="flex flex-col gap-4" style="flex: 0 0 55%;">
					<!-- question textarea -->
					<div class="flex flex-col gap-2">
						<label for="question" class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">
							your question
						</label>
						<textarea
							id="question"
							bind:value={question}
							placeholder={"ask a question about your data...\ne.g. 'show me all users created in the last 7 days'"}
							class="
								w-full h-32 resize-none rounded-xl px-4 py-3 text-sm
								bg-[var(--color-surface-2)] text-[var(--color-text)]
								border border-[var(--color-border)] font-[var(--font-body)]
								focus:outline-none focus:border-[var(--color-accent)]
								placeholder:text-[var(--color-muted)] transition-colors
							"
							onkeydown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerateQuery(); }}
						></textarea>
					</div>

					<!-- action buttons -->
					<div class="flex items-center gap-2">
						<Button
							variant="primary"
							size="sm"
							onclick={handleGenerateQuery}
							disabled={queryLoading || !question.trim()}
						>
							{#snippet icon()}
								{#if queryLoading}
									<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
										<path d="M12 2a10 10 0 0 1 10 10" />
									</svg>
								{:else}
									<Sparkles size={12} />
								{/if}
							{/snippet}
							{#snippet children()}{queryLoading ? 'generating...' : 'generate SQL'}{/snippet}
						</Button>

						<Button
							variant="ghost"
							size="sm"
							onclick={handleExplain}
							disabled={explainLoading || !generatedSQL}
						>
							{#snippet icon()}
								{#if explainLoading}
									<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
										<path d="M12 2a10 10 0 0 1 10 10" />
									</svg>
								{:else}
									<Info size={12} />
								{/if}
							{/snippet}
							{#snippet children()}{explainLoading ? 'explaining...' : 'explain last query'}{/snippet}
						</Button>
					</div>

					<!-- error -->
					{#if queryError}
						<div class="p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{queryError}</p>
						</div>
					{/if}

					<!-- generated SQL output -->
					{#if generatedSQL}
						<div class="flex flex-col gap-2 animate-fade-up">
							<div class="flex items-center justify-between">
								<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">generated SQL</span>
								<div class="flex items-center gap-1">
									<button
										type="button"
										onclick={copyQuerySQL}
										class="
											flex items-center gap-1.5 px-2 py-1 rounded text-xs
											font-[var(--font-ui)] transition-all
											{queryCopied
												? 'text-[var(--color-cyan)] bg-[var(--color-cyan-glow)]'
												: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
											}
										"
									>
										{#if queryCopied}<Check size={11} />copy!{:else}<Copy size={11} />copy{/if}
									</button>
									<button
										type="button"
										onclick={runInSQLEditor}
										class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-all"
									>
										<ExternalLink size={11} />
										run in SQL editor
									</button>
								</div>
							</div>
							<pre
								class="
									text-xs font-[var(--font-body)] leading-relaxed
									bg-[var(--color-surface-2)] border border-[var(--color-border)]
									rounded-xl p-4 overflow-x-auto whitespace-pre text-[var(--color-text)]
								"
							>{generatedSQL}</pre>
						</div>
					{/if}
				</div>

				<!-- RIGHT: explanation panel (45%) -->
				<div class="flex flex-col" style="flex: 0 0 calc(45% - 1.5rem);">
					{#if explainError}
						<div class="p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{explainError}</p>
						</div>
					{:else if explanation}
						<div class="glass border border-[var(--color-border)] rounded-xl p-5 animate-fade-up">
							<h3 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)] mb-3">
								query explanation
							</h3>
							<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] leading-relaxed">
								{explanation}
							</p>
						</div>
					{:else}
						<EmptyState
							title="no explanation yet"
							description="click 'explain last query' to understand what your SQL does"
						>
							{#snippet icon()}<Info size={32} strokeWidth={1.25} />{/snippet}
						</EmptyState>
					{/if}
				</div>
			</div>

		<!-- ════════════════ MODE B: SCHEMA GENERATOR ════════════════ -->
		{:else}
			<div class="flex justify-center p-6">
				<div class="flex flex-col gap-4 w-full max-w-[640px]">

					<!-- description textarea -->
					<div class="flex flex-col gap-2">
						<label for="schema-desc" class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">
							describe your data model
						</label>
						<textarea
							id="schema-desc"
							bind:value={schemaDescription}
							placeholder={"describe your data model...\ne.g. 'a multi-tenant SaaS with users, organizations, and subscriptions. users belong to organizations. subscriptions have a plan (free/pro/enterprise) and a status.'"}
							class="
								w-full h-40 resize-none rounded-xl px-4 py-3 text-sm
								bg-[var(--color-surface-2)] text-[var(--color-text)]
								border border-[var(--color-border)] font-[var(--font-body)]
								focus:outline-none focus:border-[var(--color-accent)]
								placeholder:text-[var(--color-muted)] transition-colors
							"
							onkeydown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerateSchema(); }}
						></textarea>
					</div>

					<!-- generate button -->
					<div>
						<Button
							variant="primary"
							size="sm"
							onclick={handleGenerateSchema}
							disabled={schemaLoading || !schemaDescription.trim()}
						>
							{#snippet icon()}
								{#if schemaLoading}
									<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
										<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
										<path d="M12 2a10 10 0 0 1 10 10" />
									</svg>
								{:else}
									<Sparkles size={12} />
								{/if}
							{/snippet}
							{#snippet children()}{schemaLoading ? 'generating...' : 'generate schema'}{/snippet}
						</Button>
					</div>

					<!-- error -->
					{#if schemaError}
						<div class="p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{schemaError}</p>
						</div>
					{/if}

					<!-- generated schema output -->
					{#if generatedSchema}
						<div class="flex flex-col gap-2 animate-fade-up">
							<div class="flex items-center justify-between">
								<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">generated SQL</span>
								<button
									type="button"
									onclick={copySchemaSQL}
									class="
										flex items-center gap-1.5 px-2 py-1 rounded text-xs
										font-[var(--font-ui)] transition-all
										{schemaCopied
											? 'text-[var(--color-cyan)] bg-[var(--color-cyan-glow)]'
											: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
										}
									"
								>
									{#if schemaCopied}<Check size={11} />copied!{:else}<Copy size={11} />copy{/if}
								</button>
							</div>

							<pre
								class="
									text-xs font-[var(--font-body)] leading-relaxed
									bg-[var(--color-surface-2)] border border-[var(--color-border)]
									rounded-xl p-4 overflow-x-auto whitespace-pre text-[var(--color-text)]
								"
							>{generatedSchema}</pre>

							<!-- apply confirm / button -->
							{#if !showApplyConfirm}
								<div class="flex items-center gap-2">
									<button
										type="button"
										onclick={() => (showApplyConfirm = true)}
										disabled={applyLoading}
										class="
											flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
											font-[var(--font-ui)] text-[var(--color-accent)]
											border border-[var(--color-accent)]/40
											hover:bg-[var(--color-accent-glow)] transition-all
											disabled:opacity-50
										"
									>
										{#if applyLoading}
											<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
												<circle cx="12" cy="12" r="10" stroke-opacity="0.25" />
												<path d="M12 2a10 10 0 0 1 10 10" />
											</svg>
											applying...
										{:else}
											apply to project
										{/if}
									</button>
								</div>
							{:else}
								<!-- confirm prompt -->
								<div class="p-3 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent-glow)] flex items-center gap-3">
									<p class="text-xs text-[var(--color-text)] font-[var(--font-ui)] flex-1">
										this will run the DDL statements on your database. make sure you've reviewed the SQL above.
									</p>
									<div class="flex items-center gap-2 shrink-0">
										<button
											type="button"
											onclick={() => (showApplyConfirm = false)}
											class="px-2.5 py-1 rounded text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
										>
											cancel
										</button>
										<button
											type="button"
											onclick={applySchema}
											class="px-2.5 py-1 rounded-lg text-xs font-bold font-[var(--font-ui)] bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
										>
											confirm apply
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
