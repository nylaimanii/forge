<script lang="ts">
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import { Sparkles, Info, Copy, Check } from 'lucide-svelte';
	import { showToast } from '$lib/stores/toasts';

	// ── per-project example questions ─────────────────────────────────────────────
	const EXAMPLE_QUESTIONS: Record<string, string[]> = {
		'demo-1': [
			'Show all active patients ordered by name',
			'Which patients have critical status?',
			'Count patients grouped by blood type',
			'List appointments in the Cardiology department',
			'Show diagnoses with severity of severe',
			'Find all appointments scheduled this week',
			'Which doctors have the most appointments?',
			'Show patients diagnosed with diabetes',
		],
		'demo-2': [
			'Show products with less than 50 units in stock',
			'Which products have a rating above 4.7?',
			'Total inventory value grouped by category',
			'Find the top 5 customers by lifetime value',
			'Show all orders with status shipped',
			'Which Electronics products cost over $100?',
			'Count orders grouped by status',
			'Show customers from California cities',
		],
		'demo-3': [
			'Show the 5 most viewed published posts',
			'Count posts and total views per author',
			'Which posts are still unpublished drafts?',
			'Show comments with more than 20 likes',
			'Find all posts in the Tutorial category',
			'Which author has the most followers?',
			'Show posts published after April 1st 2026',
			'Count posts grouped by category',
		],
	};

	const FALLBACK_QUESTIONS = [
		'Show all records ordered by id',
		'Count total rows in the table',
		'Find rows where a column is not null',
	];

	let projectId = $derived(page.params.id ?? '');
	let exampleQuestions = $derived(EXAMPLE_QUESTIONS[projectId] ?? FALLBACK_QUESTIONS);
	let exampleIndex = $state(0);
	let exampleVisible = $state(true);

	let rotationInterval: ReturnType<typeof setInterval> | null = null;

	onMount(() => {
		rotationInterval = setInterval(() => {
			exampleVisible = false;
			setTimeout(() => {
				exampleIndex = (exampleIndex + 1) % exampleQuestions.length;
				exampleVisible = true;
			}, 300);
		}, 3000);
	});

	onDestroy(() => {
		if (rotationInterval) clearInterval(rotationInterval);
	});

	function useExample(q: string) {
		question = q;
	}

	// hardcoded demo schema context
	const SCHEMA_CONTEXT = [
		'TABLE pokemon (id INTEGER, name TEXT, type TEXT, hp INTEGER, attack INTEGER, defense INTEGER)',
		'TABLE trainers (id INTEGER, name TEXT, region TEXT, badge_count INTEGER)',
	].join('\n');

	type Mode = 'query' | 'schema';
	let mode = $state<Mode>('query');

	// ── query assistant ──────────────────────────────────────────────────────────
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
			body:    JSON.stringify({ question, schema: SCHEMA_CONTEXT }),
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

	// ── schema generator ─────────────────────────────────────────────────────────
	let schemaDesc      = $state('');
	let generatedSchema = $state('');
	let schemaLoading   = $state(false);
	let schemaCopied    = $state(false);
	let schemaError     = $state('');

	async function handleGenerateSchema() {
		if (!schemaDesc.trim()) return;
		schemaLoading   = true;
		schemaError     = '';
		generatedSchema = '';

		const res = await fetch('/api/ai/generate-schema', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ description: schemaDesc }),
		});
		const payload = await res.json();
		schemaLoading = false;

		if (!res.ok || payload.error) {
			schemaError = payload.error ?? 'failed to generate schema';
			return;
		}
		generatedSchema = payload.sql;
		showToast('sign up to apply this schema to a real database', 'info');
	}

	async function copySchemaSql() {
		await navigator.clipboard.writeText(generatedSchema);
		schemaCopied = true;
		setTimeout(() => (schemaCopied = false), 2000);
	}
</script>

<div class="flex flex-col overflow-hidden -mt-12" style="height: calc(100vh - 6rem);">
	<!-- mode toggle -->
	<div class="shrink-0 flex items-center gap-3 px-6 pt-5 pb-3 border-b border-[var(--color-border)]">
		<div class="flex items-center gap-1 glass rounded-lg p-1 border border-[var(--color-border)]">
			<button
				type="button"
				onclick={() => (mode = 'query')}
				class="px-3 py-1.5 rounded-md text-xs font-[var(--font-ui)] transition-all
					{mode === 'query' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
			>Query Assistant</button>
			<button
				type="button"
				onclick={() => (mode = 'schema')}
				class="px-3 py-1.5 rounded-md text-xs font-[var(--font-ui)] transition-all
					{mode === 'schema' ? 'bg-[var(--color-accent)] text-white shadow-sm' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
			>Schema Generator</button>
		</div>
		<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
			powered by <span class="text-[var(--color-text)]">llama-3.3-70b</span> via Groq
		</p>
	</div>

	<!-- scrollable content -->
	<div class="flex-1 overflow-y-auto">

		<!-- ══ query assistant ══ -->
		{#if mode === 'query'}
			<div class="flex gap-6 p-6 h-full min-h-0">

				<!-- left: input + output (55%) -->
				<div class="flex flex-col gap-4" style="flex: 0 0 55%;">
					<div class="flex flex-col gap-2">
						<label for="question" class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">
							your question
						</label>
						<textarea
							id="question"
							bind:value={question}
							placeholder="ask about the demo data..."
							class="w-full h-32 resize-none rounded-xl px-4 py-3 text-sm
								bg-[var(--color-surface-2)] text-[var(--color-text)]
								border border-[var(--color-border)] font-[var(--font-body)]
								focus:outline-none focus:border-[var(--color-electric)]
								placeholder:text-[var(--color-muted)] transition-colors"
							onkeydown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerateQuery(); }}
						></textarea>

						<!-- rotating example question chip -->
						<div class="flex items-center gap-2">
							<span class="text-[10px] text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest shrink-0">try:</span>
							<button
								type="button"
								onclick={() => useExample(exampleQuestions[exampleIndex])}
								class="text-left text-xs font-[var(--font-ui)] text-[var(--color-electric)] hover:text-white border border-[var(--color-electric)]/30 hover:border-[var(--color-electric)] hover:bg-[var(--color-electric-dim)] rounded-lg px-3 py-1.5 transition-all duration-200 truncate max-w-[420px]"
								style="opacity: {exampleVisible ? 1 : 0}; transition: opacity 0.3s ease;"
							>{exampleQuestions[exampleIndex]}</button>
						</div>
					</div>

					<div class="flex items-center gap-2">
						<button
							onclick={handleGenerateQuery}
							disabled={queryLoading || !question.trim()}
							class="flex items-center gap-1.5 px-3 h-8 rounded-lg
								bg-[var(--color-accent)] text-[#05050a]
								text-xs font-[var(--font-display)] font-semibold
								disabled:opacity-50 hover:bg-white transition-all"
						>
							{#if queryLoading}
								<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
									<path d="M12 2a10 10 0 0 1 10 10"/>
								</svg>
								generating...
							{:else}
								<Sparkles size={12} />
								generate SQL
							{/if}
						</button>
						<button
							onclick={handleExplain}
							disabled={explainLoading || !generatedSQL}
							class="flex items-center gap-1.5 px-3 h-8 rounded-lg
								border border-[var(--color-border)]
								text-xs text-[var(--color-muted)] font-[var(--font-ui)]
								disabled:opacity-50 hover:text-[var(--color-text)] hover:border-[var(--color-border-active)]
								transition-all"
						>
							{#if explainLoading}
								<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
									<path d="M12 2a10 10 0 0 1 10 10"/>
								</svg>
								explaining...
							{:else}
								<Info size={12} />
								explain
							{/if}
						</button>
					</div>

					{#if queryError}
						<div class="p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{queryError}</p>
						</div>
					{/if}

					{#if generatedSQL}
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">generated SQL</span>
								<button
									onclick={copyQuerySQL}
									class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-[var(--font-ui)] transition-all
										{queryCopied ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'}"
								>
									{#if queryCopied}<Check size={11} />copied!{:else}<Copy size={11} />copy{/if}
								</button>
							</div>
							<pre class="text-xs font-[var(--font-body)] leading-relaxed bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 overflow-x-auto whitespace-pre text-[var(--color-text)]">{generatedSQL}</pre>
						</div>
					{/if}
				</div>

				<!-- right: explanation (45%) -->
				<div class="flex flex-col" style="flex: 0 0 calc(45% - 1.5rem);">
					{#if explainError}
						<div class="p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{explainError}</p>
						</div>
					{:else if explanation}
						<div class="glass border border-[var(--color-border)] rounded-xl p-5">
							<h3 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)] mb-3">query explanation</h3>
							<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] leading-relaxed">{explanation}</p>
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center h-40 text-center px-4">
							<Info size={32} strokeWidth={1.25} class="text-[var(--color-muted)] opacity-40 mb-3" />
							<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)]">click 'explain' to understand what your SQL does</p>
						</div>
					{/if}
				</div>
			</div>

		<!-- ══ schema generator ══ -->
		{:else}
			<div class="flex justify-center p-6">
				<div class="flex flex-col gap-4 w-full max-w-[640px]">
					<div class="flex flex-col gap-2">
						<label for="schema-desc" class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">
							describe your data model
						</label>
						<textarea
							id="schema-desc"
							bind:value={schemaDesc}
							placeholder={"describe your data model...\ne.g. 'a blog with users, posts, and comments. users can like posts.'"}
							class="w-full h-40 resize-none rounded-xl px-4 py-3 text-sm
								bg-[var(--color-surface-2)] text-[var(--color-text)]
								border border-[var(--color-border)] font-[var(--font-body)]
								focus:outline-none focus:border-[var(--color-electric)]
								placeholder:text-[var(--color-muted)] transition-colors"
							onkeydown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleGenerateSchema(); }}
						></textarea>
					</div>

					<div>
						<button
							onclick={handleGenerateSchema}
							disabled={schemaLoading || !schemaDesc.trim()}
							class="flex items-center gap-1.5 px-3 h-8 rounded-lg
								bg-[var(--color-accent)] text-[#05050a]
								text-xs font-[var(--font-display)] font-semibold
								disabled:opacity-50 hover:bg-white transition-all"
						>
							{#if schemaLoading}
								<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
									<circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
									<path d="M12 2a10 10 0 0 1 10 10"/>
								</svg>
								generating...
							{:else}
								<Sparkles size={12} />
								generate schema
							{/if}
						</button>
					</div>

					{#if schemaError}
						<div class="p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{schemaError}</p>
						</div>
					{/if}

					{#if generatedSchema}
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<span class="text-xs text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest">generated SQL</span>
								<button
									onclick={copySchemaSql}
									class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-[var(--font-ui)] transition-all
										{schemaCopied ? 'text-[var(--color-success)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'}"
								>
									{#if schemaCopied}<Check size={11} />copied!{:else}<Copy size={11} />copy{/if}
								</button>
							</div>
							<pre class="text-xs font-[var(--font-body)] leading-relaxed bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl p-4 overflow-x-auto whitespace-pre text-[var(--color-text)]">{generatedSchema}</pre>
							<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
								<a href="/signup" class="text-[var(--color-electric)] hover:underline">sign up</a>
								to apply this schema to a real database →
							</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
