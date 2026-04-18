<svelte:head>
	<title>Forge — Build databases like a designer</title>
	<meta name="description" content="Visual schema design, AI-powered SQL, and real-time data visualization — all in one developer workspace." />
</svelte:head>

<!-- ── STICKY NAV ──────────────────────────────────────────────────────────── -->
<nav class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-8 bg-[color-mix(in_srgb,var(--color-bg)_85%,transparent)] backdrop-blur-xl border-b border-[var(--color-border)]">
	<div class="flex items-center gap-3 flex-1">
		<div class="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center text-[#09090b] font-[var(--font-display)] font-bold text-base">
			f
		</div>
		<span class="text-base font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">forge</span>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/login"
			class="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors font-[var(--font-ui)] px-3 py-1.5 rounded-lg hover:bg-white/5"
		>
			Log in
		</a>
		<a
			href="/signup"
			class="text-sm bg-[var(--color-accent)] text-[#09090b] font-semibold px-4 py-1.5 rounded-lg hover:bg-[#fbbf24] transition-colors font-[var(--font-ui)]"
		>
			Get started free
		</a>
	</div>
</nav>

<!-- ── HERO ───────────────────────────────────────────────────────────────── -->
<section class="relative min-h-screen flex items-center justify-center pt-14 overflow-hidden">
	<!-- amber glow orb -->
	<div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full bg-[var(--color-accent)] opacity-[0.045] blur-[140px] pointer-events-none"></div>
	<!-- dot grid -->
	<div
		class="absolute inset-0 opacity-[0.035] pointer-events-none"
		style="background-image: radial-gradient(circle, #fafaf9 1px, transparent 1px); background-size: 32px 32px;"
	></div>

	<div class="relative z-10 text-center px-6 max-w-4xl mx-auto">
		<!-- eyebrow badge -->
		<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent)]/30 mb-7 animate-fade-up animate-fade-up-1">
			<span class="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] inline-block"></span>
			<span class="text-[var(--color-accent)] text-xs font-semibold font-[var(--font-ui)] tracking-wide uppercase">Open source · Free forever</span>
		</div>

		<!-- headline -->
		<h1 class="text-5xl md:text-[4.5rem] font-bold text-[var(--color-text)] font-[var(--font-display)] leading-[1.05] tracking-tight mb-6 animate-fade-up animate-fade-up-2">
			Build databases<br>
			<span class="text-[var(--color-accent)]">like a designer.</span>
		</h1>

		<!-- sub -->
		<p class="text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed font-[var(--font-ui)] mb-10 animate-fade-up animate-fade-up-3">
			Visual schema design, AI-powered SQL, and real-time data visualization —<br class="hidden md:block" />
			all in one developer workspace.
		</p>

		<!-- CTAs -->
		<div class="flex items-center justify-center gap-4 flex-wrap animate-fade-up animate-fade-up-4">
			<a
				href="/signup"
				class="inline-flex items-center gap-2 px-7 py-3 bg-[var(--color-accent)] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#fbbf24] transition-all duration-150 shadow-[0_0_40px_var(--color-accent-glow)] font-[var(--font-ui)]"
			>
				Get started free
				<span class="text-base">→</span>
			</a>
			<a
				href="/login"
				class="inline-flex items-center gap-2 px-7 py-3 text-[var(--color-text)] text-sm rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 hover:bg-white/5 transition-all duration-150 font-[var(--font-ui)]"
			>
				Already have an account
			</a>
		</div>
	</div>
</section>

<!-- ── FEATURES ───────────────────────────────────────────────────────────── -->
<section class="py-24 px-6 border-t border-[var(--color-border)]">
	<div class="max-w-5xl mx-auto">
		<div class="text-center mb-14">
			<h2 class="text-3xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight mb-3">
				Everything you need, nothing you don't
			</h2>
			<p class="text-[var(--color-muted)] font-[var(--font-ui)]">A complete workspace from schema design to production.</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each [
				{
					icon: '⬡',
					title: 'Schema Builder',
					desc: 'Visual canvas to design tables, fields, and relationships. Draw connections, set types, and export SQL in one click.',
				},
				{
					icon: '✦',
					title: 'AI Query Assistant',
					desc: 'Ask questions in plain English. Groq-powered Llama generates precise SQL queries and explains them back to you.',
				},
				{
					icon: '◈',
					title: 'SQL Editor',
					desc: 'Monaco-powered editor with syntax highlighting, query history, and Ctrl+Enter to run against your live database.',
				},
				{
					icon: '⬖',
					title: 'Data Visualize',
					desc: 'Table view and custom card view to explore your data with sort, search, pagination, and a designer for card layouts.',
				},
				{
					icon: '◻',
					title: 'Whiteboard',
					desc: 'tldraw-powered canvas for system diagrams, data flow planning, and dropping live data cards from your tables.',
				},
				{
					icon: '◉',
					title: 'Supabase Powered',
					desc: 'Real-time Postgres database, row-level security, and auth built in by default. Your data, your rules.',
				},
			] as feat, i}
				<div
					class="group p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] hover:border-[var(--color-accent)]/25 hover:bg-[var(--color-surface-2)] transition-all duration-200 animate-fade-up"
					style="animation-delay: {i * 50}ms"
				>
					<div class="text-xl mb-3 text-[var(--color-accent)]">{feat.icon}</div>
					<h3 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)] mb-1.5">{feat.title}</h3>
					<p class="text-xs text-[var(--color-muted)] leading-relaxed font-[var(--font-ui)]">{feat.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── HOW IT WORKS ───────────────────────────────────────────────────────── -->
<section class="py-24 px-6 border-t border-[var(--color-border)]">
	<div class="max-w-4xl mx-auto">
		<div class="text-center mb-16">
			<h2 class="text-3xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight mb-3">
				From idea to data in minutes
			</h2>
			<p class="text-[var(--color-muted)] font-[var(--font-ui)]">Three steps. No config required.</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-10">
			{#each [
				{
					step: '01',
					title: 'Design your schema',
					desc: 'Drag tables onto the canvas. Define fields, set data types, and draw relationships by connecting table edges.',
				},
				{
					step: '02',
					title: 'Query with AI or SQL',
					desc: 'Use the Monaco SQL editor or describe what you want to the AI assistant — it writes the query, you run it.',
				},
				{
					step: '03',
					title: 'Visualize and export',
					desc: 'Browse results in table or custom card view. Export your SQL schema to use in any Postgres-compatible database.',
				},
			] as item, i}
				<div class="animate-fade-up" style="animation-delay: {i * 80}ms">
					<div class="text-6xl font-bold text-[var(--color-accent)]/20 font-[var(--font-display)] mb-4 leading-none tabular-nums">
						{item.step}
					</div>
					<h3 class="text-base font-bold text-[var(--color-text)] font-[var(--font-display)] mb-2">{item.title}</h3>
					<p class="text-sm text-[var(--color-muted)] leading-relaxed font-[var(--font-ui)]">{item.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── STATS ──────────────────────────────────────────────────────────────── -->
<section class="py-20 px-6 border-t border-[var(--color-border)]">
	<div class="max-w-3xl mx-auto">
		<div class="grid grid-cols-3 gap-8 text-center">
			{#each [
				{ value: '100%', label: 'Free forever' },
				{ value: '∞', label: 'Projects' },
				{ value: '0', label: 'Credit cards' },
			] as stat}
				<div>
					<div class="text-4xl font-bold text-[var(--color-accent)] font-[var(--font-display)] mb-1">{stat.value}</div>
					<div class="text-sm text-[var(--color-muted)] font-[var(--font-ui)]">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- ── CTA ────────────────────────────────────────────────────────────────── -->
<section class="py-24 px-6 border-t border-[var(--color-border)]">
	<div class="max-w-2xl mx-auto text-center">
		<div class="p-px rounded-2xl bg-gradient-to-b from-[var(--color-accent)]/25 via-[var(--color-accent)]/10 to-transparent">
			<div class="px-8 py-12 rounded-2xl bg-[var(--color-surface-1)]">
				<h2 class="text-3xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight mb-3">
					Ready to forge something great?
				</h2>
				<p class="text-[var(--color-muted)] font-[var(--font-ui)] mb-8 text-sm">
					Start building for free — no credit card, no setup, no limits.
				</p>
				<a
					href="/signup"
					class="inline-flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-[#09090b] font-bold text-sm rounded-xl hover:bg-[#fbbf24] transition-all duration-150 shadow-[0_0_40px_var(--color-accent-glow)] font-[var(--font-ui)]"
				>
					Create your account →
				</a>
			</div>
		</div>

		<p class="mt-8 text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
			Built with SvelteKit, Supabase, and Groq ·
			<a href="/login" class="hover:text-[var(--color-text)] transition-colors ml-1">Already have an account?</a>
		</p>
	</div>
</section>
