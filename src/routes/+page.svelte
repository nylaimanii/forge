<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Forge — your database, beautifully engineered</title>
	<meta name="description" content="forge is the database builder for developers who think visually. schema, sql, ai, cards, and infinite canvas — in one tool." />
</svelte:head>

<div style="width:100%; overflow-x:hidden; background:#05050a;">

<!-- ── HERO ──────────────────────────────────────────────────────────────────── -->
<section style="width:100%; min-height:100vh; padding:80px 0; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; overflow:hidden;">

	<!-- electric blue ambient glow -->
	<div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[var(--color-electric)] opacity-[0.04] blur-[160px] pointer-events-none"></div>

	<!-- dot grid -->
	<div
		class="absolute inset-0 opacity-[0.025] pointer-events-none"
		style="background-image:radial-gradient(circle,rgba(241,245,249,0.8) 1px,transparent 1px); background-size:28px 28px;"
	></div>

	<!-- content -->
	<div style="max-width:720px; margin:0 auto; padding:0 24px; width:100%; display:flex; flex-direction:column; align-items:center; text-align:center; position:relative; z-index:10;">

		<!-- wordmark -->
		<p class="font-[var(--font-body)] text-[11px] text-[var(--color-muted)] tracking-[0.3em] uppercase mb-12 animate-fade-up animate-fade-up-1">
			FORGE
		</p>

		<!-- headline -->
		<h1
			class="font-[var(--font-display)] font-bold leading-[1.05] tracking-tight mb-8 animate-fade-up animate-fade-up-2"
			style="font-size:clamp(2.5rem,8vw,5rem); text-align:center;"
		>
			<span class="text-[var(--color-text)] block">your database,</span>
			<span class="text-[var(--color-electric)] italic block">beautifully</span>
			<span class="text-[var(--color-text)] block">engineered.</span>
		</h1>

		<!-- subtitle -->
		<p
			class="text-[var(--color-muted)] font-[var(--font-ui)] leading-[1.7] mb-10 animate-fade-up animate-fade-up-3"
			style="font-size:clamp(0.875rem,2vw,1rem); max-width:440px; text-align:center;"
		>
			forge is the database builder for developers who think visually. schema, sql, ai, cards, and infinite canvas — in one tool.
		</p>

		<!-- CTAs -->
		<div class="flex flex-col sm:flex-row items-center gap-4 justify-center mb-10 animate-fade-up animate-fade-up-4 w-full sm:w-auto">
			<a
				href="/signup"
				class="inline-flex items-center justify-center w-full sm:w-auto h-12 px-6 rounded-lg bg-[var(--color-accent)] text-[#05050a] font-[var(--font-display)] font-semibold text-sm hover:bg-white hover:shadow-[0_0_32px_rgba(226,232,240,0.25)] transition-all duration-150"
			>
				start building →
			</a>
			<a
				href="/demo"
				class="inline-flex items-center justify-center w-full sm:w-auto h-12 px-6 rounded-lg border border-[var(--color-border-active)] text-[var(--color-text)] font-[var(--font-display)] font-medium text-sm hover:border-[var(--color-electric)]/40 hover:text-[var(--color-electric)] transition-all duration-150"
			>
				try a demo →
			</a>
		</div>

		<!-- live stat badge -->
		<div class="flex items-center gap-2 animate-fade-up animate-fade-up-5">
			<span class="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse inline-block shrink-0"></span>
			<span class="font-[var(--font-body)] text-[11px] text-[var(--color-muted)]">
				live · {data.projectCount} projects built on forge
			</span>
		</div>
	</div>

	<!-- down arrow -->
	<div class="absolute bottom-10 left-1/2 -translate-x-1/2 text-[var(--color-muted)] animate-bounce-gentle text-lg select-none">
		↓
	</div>
</section>

<!-- ── FEATURES ───────────────────────────────────────────────────────────────── -->
<section style="width:100%; padding:96px 0; border-top:1px solid rgba(255,255,255,0.06);">

	<!-- heading block — centered -->
	<div style="max-width:720px; margin:0 auto; padding:0 24px; width:100%; text-align:center;">
		<p class="font-[var(--font-body)] text-[10px] text-[var(--color-electric)] tracking-[0.25em] uppercase mb-4">
			CAPABILITIES
		</p>
		<h2
			class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-3"
			style="font-size:clamp(1.8rem,5vw,3rem); text-align:center;"
		>
			everything in one workspace
		</h2>
		<p
			class="text-[var(--color-muted)] font-[var(--font-ui)]"
			style="font-size:clamp(0.875rem,2vw,1rem); text-align:center; margin-bottom:64px;"
		>
			designed for developers who want to move fast and look good doing it.
		</p>
	</div>

	<!-- feature cards — left-aligned content inside each card -->
	<div style="max-width:720px; margin:0 auto; padding:0 24px; width:100%; display:flex; flex-direction:column; gap:16px;">
		{#each [
			{
				emoji: '🗂',
				title: 'visual schema builder',
				desc: 'drag tables, draw relationships, export sql. no orm config. no migration hell. just a canvas and your ideas.',
			},
			{
				emoji: '✦',
				title: 'ai-powered queries',
				desc: 'describe your data in plain english. groq llama generates sql instantly. ask follow-up questions. it remembers context.',
			},
			{
				emoji: '🃏',
				title: 'data visualization',
				desc: 'turn rows into pokemon-style cards. drop live data onto an infinite canvas. sort, filter, and visualize without writing a line of ui code.',
			},
		] as feat}
			<div
				class="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-hidden hover:border-[var(--color-border-active)] hover:-translate-y-0.5 hover:shadow-[0_8px_40px_var(--color-electric-glow)] transition-all duration-200 cursor-default"
				style="display:flex; flex-direction:row; align-items:center; gap:16px; padding:24px;"
			>
				<span style="font-size:3rem; flex-shrink:0; line-height:1;">{feat.emoji}</span>
				<div style="text-align:left; flex:1;">
					<h3 class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-lg mb-1.5">
						{feat.title}
					</h3>
					<p class="font-[var(--font-ui)] text-[var(--color-muted)] text-sm leading-relaxed">
						{feat.desc}
					</p>
				</div>
				<span
					class="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-electric)] text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150"
				>→</span>
			</div>
		{/each}
	</div>
</section>

<!-- ── HOW IT WORKS ───────────────────────────────────────────────────────────── -->
<section style="width:100%; padding:96px 0; border-top:1px solid rgba(255,255,255,0.06);">

	<!-- heading block — centered -->
	<div style="max-width:720px; margin:0 auto; padding:0 24px; width:100%; text-align:center;">
		<p class="font-[var(--font-body)] text-[10px] text-[var(--color-electric)] tracking-[0.25em] uppercase mb-4">
			HOW IT WORKS
		</p>
		<h2
			class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-3"
			style="font-size:clamp(1.4rem,3.5vw,2.5rem); text-align:center;"
		>
			from idea to database in 60 seconds
		</h2>
		<p
			class="text-[var(--color-muted)] font-[var(--font-ui)]"
			style="font-size:clamp(0.875rem,2vw,1rem); text-align:center; margin-bottom:80px;"
		>
			no yaml. no config files. no reading the docs at 2am.
		</p>
	</div>

	<!-- steps -->
	<div style="max-width:720px; margin:0 auto; padding:0 24px; width:100%; display:flex; flex-direction:column; gap:64px;">
		{#each [
			{
				n: 1,
				title: 'describe your schema',
				desc: 'type what your app needs. the ai fills in the details.',
				checks: ['takes under 60 seconds', 'plain english to sql', 'ai fills in the details'],
				emoji: '✏️',
			},
			{
				n: 2,
				title: 'build visually',
				desc: 'drag tables, draw lines, define every field on a canvas.',
				checks: ['drag-and-drop table canvas', 'draw relationship lines', 'export or apply directly'],
				emoji: '🖥',
			},
			{
				n: 3,
				title: 'explore your data',
				desc: 'browse results as cards, tables, or on an infinite canvas.',
				checks: ['pokemon-style data cards', 'live data on infinite canvas', 'sort, filter, visualize'],
				emoji: '🃏',
			},
		] as step, i}
			<div class="flex flex-col {i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center">

				<!-- text content -->
				<div style="flex:1; text-align:left;">
					<span
						class="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-electric)] font-[var(--font-body)] text-[10px] mb-4"
						style="padding:4px 12px;"
					>
						Step {step.n}
					</span>
					<h3 class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-2xl mb-2">
						{step.title}
					</h3>
					<p class="text-[var(--color-muted)] font-[var(--font-ui)] text-sm mb-5">{step.desc}</p>
					<ul style="display:flex; flex-direction:column; gap:8px;">
						{#each step.checks as check}
							<li class="flex items-center gap-2 text-[var(--color-muted)] font-[var(--font-ui)] text-sm">
								<span class="text-[var(--color-electric)] font-semibold text-xs shrink-0">✓</span>
								{check}
							</li>
						{/each}
					</ul>
				</div>

				<!-- illustration -->
				<div style="flex:1;">
					<div
						class="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center overflow-hidden"
						style="height:192px;"
					>
						<span style="font-size:3.75rem;">{step.emoji}</span>
					</div>
				</div>

			</div>
		{/each}
	</div>
</section>

<!-- ── STATS ──────────────────────────────────────────────────────────────────── -->
<section style="width:100%; padding:96px 0;">
	<div style="max-width:720px; margin:0 auto; padding:0 24px; width:100%;">
		<div
			class="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-1)]"
			style="padding:64px 32px;"
		>
			<div class="flex flex-col sm:flex-row justify-around gap-8 text-center">
				{#each [
					{ value: '5',    label: 'core views' },
					{ value: '∞',    label: 'rows you can visualize' },
					{ value: '100%', label: 'free to use' },
				] as stat}
					<div>
						<div
							class="font-[var(--font-display)] font-bold text-[var(--color-electric)] leading-none mb-2"
							style="font-size:72px;"
						>
							{stat.value}
						</div>
						<div class="text-[var(--color-muted)] font-[var(--font-ui)] text-sm">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- ── CTA ────────────────────────────────────────────────────────────────────── -->
<section style="width:100%; padding:96px 0 0;">
	<div style="max-width:720px; margin:0 auto; padding:0 24px; width:100%;">
		<div class="p-px rounded-3xl bg-gradient-to-b from-[var(--color-electric)]/30 via-[var(--color-electric)]/10 to-transparent">
			<div
				class="rounded-3xl bg-[var(--color-surface-1)]"
				style="padding:80px 32px; text-align:center;"
			>
				<h2
					class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-3"
					style="font-size:clamp(1.8rem,5vw,3rem); text-align:center;"
				>
					ready to build?
				</h2>
				<p class="text-[var(--color-muted)] font-[var(--font-ui)] text-sm mb-10">
					no credit card. no setup. just forge.
				</p>
				<div class="flex flex-col sm:flex-row items-center gap-4 justify-center">
					<a
						href="/signup"
						class="inline-flex items-center justify-center w-full sm:w-auto h-12 px-6 rounded-lg bg-[var(--color-accent)] text-[#05050a] font-[var(--font-display)] font-semibold text-sm hover:bg-white hover:shadow-[0_0_32px_rgba(226,232,240,0.25)] transition-all duration-150"
					>
						start building →
					</a>
					<a
						href="/demo"
						class="inline-flex items-center justify-center w-full sm:w-auto h-12 px-6 rounded-lg border border-[var(--color-border-active)] text-[var(--color-text)] font-[var(--font-display)] font-medium text-sm hover:border-[var(--color-electric)]/40 hover:text-[var(--color-electric)] transition-all duration-150"
					>
						try a demo →
					</a>
				</div>
				<p
					class="font-[var(--font-body)] text-[10px] text-[var(--color-muted)] tracking-wide"
					style="margin-top:40px;"
				>
					free forever · supabase + groq · open source soon
				</p>
			</div>
		</div>
	</div>
</section>

<!-- ── FOOTER ─────────────────────────────────────────────────────────────────── -->
<footer style="padding:48px 0; text-align:center;">
	<p class="font-[var(--font-body)] text-xs text-[var(--color-muted)]">forge © 2025</p>
</footer>

</div>
