<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { demoData } from '$lib/stores/demo';
	import { showToast } from '$lib/stores/toasts';
	import { Play, Clock, Copy } from 'lucide-svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let editor: any;
	let editorEl: HTMLDivElement | undefined = $state();

	let sql     = $state('SELECT * FROM pokemon;');
	let result  = $state<Record<string, unknown>[] | null>(null);
	let cols    = $state<string[]>([]);
	let running = $state(false);

	let history = $derived($demoData.queryHistory);

	onMount(async () => {
		const loader = (await import('@monaco-editor/loader')).default;
		const monaco = await loader.init();

		editor = monaco.editor.create(editorEl!, {
			value:                 sql,
			language:              'sql',
			theme:                 'vs-dark',
			minimap:               { enabled: false },
			fontSize:              13,
			lineNumbers:           'on' as const,
			scrollBeyondLastLine:  false,
			automaticLayout:       true,
			fontFamily:            "'Space Mono', 'Courier New', monospace",
			padding:               { top: 16, bottom: 16 },
		});

		editor.onDidChangeModelContent(() => { sql = editor.getValue(); });
	});

	onDestroy(() => { editor?.dispose(); });

	function runQuery() {
		running = true;
		setTimeout(() => {
			running = false;
			result  = $demoData.rows;
			cols    = result.length > 0 ? Object.keys(result[0]) : [];
			showToast('ran against demo data — sign up to connect a real database', 'info');
		}, 400);
	}

	function loadHistory(item: typeof history[0]) {
		editor?.setValue(item.sql);
	}

	async function copySQL() {
		await navigator.clipboard.writeText(sql);
		showToast('copied to clipboard', 'success');
	}
</script>

<div class="flex overflow-hidden -mt-12" style="height: calc(100vh - 6rem);">
	<!-- history sidebar -->
	<div class="w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-1)] flex flex-col">
		<div class="px-4 py-3 border-b border-[var(--color-border)]">
			<p class="text-[10px] text-[var(--color-muted)] font-[var(--font-ui)] uppercase tracking-widest flex items-center gap-1.5">
				<Clock size={10} />
				query history
			</p>
		</div>
		<div class="flex-1 overflow-y-auto py-2">
			{#each history as item}
				<button
					onclick={() => loadHistory(item)}
					class="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors"
				>
					<p class="text-xs text-[var(--color-text)] font-[var(--font-ui)] truncate mb-0.5">{item.question}</p>
					<p class="text-[10px] text-[var(--color-muted)] font-[var(--font-body)] truncate">{item.sql}</p>
				</button>
			{/each}
		</div>
	</div>

	<!-- main area -->
	<div class="flex-1 flex flex-col min-w-0">
		<!-- editor -->
		<div class="relative shrink-0" style="height: 220px;">
			<div bind:this={editorEl} class="h-full w-full"></div>

			<!-- toolbar overlay -->
			<div class="absolute top-3 right-3 flex items-center gap-2 z-10">
				<button
					onclick={copySQL}
					class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
						bg-[var(--color-surface-2)] border border-[var(--color-border)]
						text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]
						font-[var(--font-ui)] transition-colors"
				>
					<Copy size={11} />
					copy
				</button>
				<button
					onclick={runQuery}
					disabled={running}
					class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
						bg-[var(--color-accent)] text-[#05050a]
						text-xs font-[var(--font-display)] font-semibold
						hover:bg-white transition-colors disabled:opacity-60"
				>
					{#if running}
						<svg class="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<circle cx="12" cy="12" r="10" stroke-opacity=".25" />
							<path d="M12 2a10 10 0 0 1 10 10" />
						</svg>
						running...
					{:else}
						<Play size={11} />
						run
					{/if}
				</button>
			</div>
		</div>

		<!-- divider -->
		<div class="h-px bg-[var(--color-border)] shrink-0"></div>

		<!-- results table -->
		<div class="flex-1 overflow-auto">
			{#if result}
				<table class="w-full text-xs font-[var(--font-body)]">
					<thead class="sticky top-0 bg-[var(--color-surface-2)] border-b border-[var(--color-border)]">
						<tr>
							{#each cols as col}
								<th class="text-left px-4 py-2 text-[var(--color-muted)] font-medium whitespace-nowrap">{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each result as row}
							<tr class="border-b border-[var(--color-border)]/50 hover:bg-white/[0.02]">
								{#each cols as col}
									<td class="px-4 py-2 text-[var(--color-text)] whitespace-nowrap">{row[col]}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="flex items-center justify-center h-full">
					<p class="text-[var(--color-muted)] font-[var(--font-ui)] text-sm">
						run a query to see results
					</p>
				</div>
			{/if}
		</div>
	</div>
</div>
