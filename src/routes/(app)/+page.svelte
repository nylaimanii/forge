<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Forge — your database, beautifully engineered</title>
	<meta name="description" content="forge is the database builder for developers who think visually. schema, sql, ai, cards, and infinite canvas — in one tool." />
</svelte:head>

<!-- ── HERO ──────────────────────────────────────────────────────────────────── -->
<section class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[var(--color-bg)]">
	<!-- electric blue ambient glow -->
	<div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-[var(--color-electric)] opacity-[0.04] blur-[160px] pointer-events-none"></div>
	<!-- dot grid -->
	<div
		class="absolute inset-0 opacity-[0.025] pointer-events-none"
		style="background-image: radial-gradient(circle, rgba(241,245,249,0.8) 1px, transparent 1px); background-size: 28px 28px;"
	></div>

	<!-- content -->
	<div class="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto">

		<!-- wordmark -->
		<p class="font-[var(--font-body)] text-[11px] text-[var(--color-muted)] tracking-[0.3em] uppercase mb-12 animate-fade-up animate-fade-up-1">
			FORGE
		</p>

		<!-- headline -->
		<h1
			class="font-[var(--font-display)] font-bold leading-[1.05] tracking-tight mb-8 animate-fade-up animate-fade-up-2"
			style="font-size: clamp(3.25rem, 8vw, 5rem);"
		>
			<span class="text-[var(--color-text)] block">your database,</span>
			<span class="text-[var(--color-electric)] italic block">beautifully</span>
			<span class="text-[var(--color-text)] block">engineered.</span>
		</h1>

		<!-- subtitle -->
		<p
			class="text-[var(--color-muted)] font-[var(--font-ui)] leading-[1.7] mb-10 animate-fade-up animate-fade-up-3"
			style="max-width: 440px; font-size: 16px;"
		>
			forge is the database builder for developers who think visually. schema, sql, ai, cards, and infinite canvas — in one tool.
		</p>

		<!-- CTAs -->
		<div class="flex items-center gap-4 flex-wrap justify-center mb-10 animate-fade-up animate-fade-up-4">
			<a
				href="/signup"
				class="inline-flex items-center h-12 px-6 rounded-lg bg-[var(--color-accent)] text-[#05050a] font-[var(--font-display)] font-semibold text-sm hover:bg-white hover:shadow-[0_0_32px_rgba(226,232,240,0.25)] transition-all duration-150"
			>
				start building →
			</a>
			<a
				href="/login"
				class="inline-flex items-center h-12 px-6 rounded-lg border border-[var(--color-border-active)] text-[var(--color-text)] font-[var(--font-display)] font-medium text-sm hover:border-[var(--color-electric)]/40 hover:text-[var(--color-electric)] transition-all duration-150"
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
<section class="py-32 px-6">
	<div class="max-w-3xl mx-auto">
		<!-- label -->
		<p class="font-[var(--font-body)] text-[10px] text-[var(--color-electric)] tracking-[0.25em] uppercase mb-4">
			CAPABILITIES
		</p>
		<h2 class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-3" style="font-size: clamp(2rem, 5vw, 3rem);">
			everything in one workspace
		</h2>
		<p class="text-[var(--color-muted)] font-[var(--font-ui)] mb-16 text-sm">
			designed for developers who want to move fast and look good doing it.
		</p>

		<div class="flex flex-col gap-4">
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
					class="group relative p-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)]
						hover:border-[var(--color-border-active)] hover:-translate-y-0.5
						hover:shadow-[0_8px_40px_var(--color-electric-glow)]
						transition-all duration-200 cursor-default"
				>
					<div class="flex items-start gap-6">
						<span class="text-5xl shrink-0 leading-none mt-0.5">{feat.emoji}</span>
						<div>
							<h3 class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-lg mb-1.5">
								{feat.title}
							</h3>
							<p class="font-[var(--font-ui)] text-[var(--color-muted)] text-sm leading-relaxed">
								{feat.desc}
							</p>
						</div>
					</div>
					<span
						class="absolute right-8 top-1/2 -translate-y-1/2 text-[var(--color-electric)] text-lg
							opacity-0 group-hover:opacity-100 transition-opacity duration-150"
					>→</span>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── HOW IT WORKS ───────────────────────────────────────────────────────────── -->
<section class="py-32 px-6 border-t border-[var(--color-border)]">
	<div class="max-w-3xl mx-auto">
		<p class="font-[var(--font-body)] text-[10px] text-[var(--color-electric)] tracking-[0.25em] uppercase mb-4">
			HOW IT WORKS
		</p>
		<h2 class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-3" style="font-size: clamp(2rem, 5vw, 3rem);">
			from idea to database in 60 seconds
		</h2>
		<p class="text-[var(--color-muted)] font-[var(--font-ui)] mb-20 text-sm">
			no yaml. no config files. no reading the docs at 2am.
		</p>

		<div class="flex flex-col gap-16">
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
				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center {i % 2 === 1 ? 'md:[direction:rtl]' : ''}">
					<!-- content -->
					<div class="{i % 2 === 1 ? 'md:[direction:ltr]' : ''}">
						<span class="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-electric)] font-[var(--font-body)] text-[10px] mb-4">
							Step {step.n}
						</span>
						<h3 class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-2xl mb-2">
							{step.title}
						</h3>
						<p class="text-[var(--color-muted)] font-[var(--font-ui)] text-sm mb-5">{step.desc}</p>
						<ul class="flex flex-col gap-2">
							{#each step.checks as check}
								<li class="flex items-center gap-2 text-[var(--color-muted)] font-[var(--font-ui)] text-sm">
									<span class="text-[var(--color-electric)] font-semibold text-xs shrink-0">✓</span>
									{check}
								</li>
							{/each}
						</ul>
					</div>

					<!-- illustration card -->
					<div class="{i % 2 === 1 ? 'md:[direction:ltr]' : ''}">
						<div class="h-48 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center">
							<span class="text-6xl">{step.emoji}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── STATS ──────────────────────────────────────────────────────────────────── -->
<section class="py-16 px-6">
	<div class="max-w-3xl mx-auto">
		<div class="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-1)] py-16 px-8">
			<div class="flex flex-col sm:flex-row justify-around gap-10 text-center">
				{#each [
					{ value: '5', label: 'core views' },
					{ value: '∞', label: 'rows you can visualize' },
					{ value: '100%', label: 'free to use' },
				] as stat}
					<div>
						<div class="font-[var(--font-display)] font-bold text-[var(--color-electric)] leading-none mb-2" style="font-size: 72px;">
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
<section class="py-16 px-6 pb-0">
	<div class="max-w-3xl mx-auto">
		<div class="p-px rounded-3xl bg-gradient-to-b from-[var(--color-electric)]/30 via-[var(--color-electric)]/10 to-transparent">
			<div class="rounded-3xl bg-[var(--color-surface-1)] py-20 px-8 text-center">
				<h2 class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-3" style="font-size: clamp(2rem, 5vw, 3rem);">
					ready to build?
				</h2>
				<p class="text-[var(--color-muted)] font-[var(--font-ui)] text-sm mb-10">
					no credit card. no setup. just forge.
				</p>
				<div class="flex items-center gap-4 flex-wrap justify-center">
					<a
						href="/signup"
						class="inline-flex items-center h-12 px-6 rounded-lg bg-[var(--color-accent)] text-[#05050a] font-[var(--font-display)] font-semibold text-sm hover:bg-white hover:shadow-[0_0_32px_rgba(226,232,240,0.25)] transition-all duration-150"
					>
						start building →
					</a>
					<a
						href="/login"
						class="inline-flex items-center h-12 px-6 rounded-lg border border-[var(--color-border-active)] text-[var(--color-text)] font-[var(--font-display)] font-medium text-sm hover:border-[var(--color-electric)]/40 hover:text-[var(--color-electric)] transition-all duration-150"
					>
						try a demo →
					</a>
				</div>
				<p class="mt-10 font-[var(--font-body)] text-[10px] text-[var(--color-muted)] tracking-wide">
					free forever · supabase + groq · open source soon
				</p>
			</div>
		</div>
	</div>
</section>

<!-- ── FOOTER ─────────────────────────────────────────────────────────────────── -->
<footer class="py-12 text-center">
	<p class="font-[var(--font-body)] text-xs text-[var(--color-muted)]">forge © 2025</p>
</footer>
