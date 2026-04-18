<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserSupabase } from '$lib/supabase';
	import { showToast } from '$lib/stores/toasts';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Toast from '$components/ui/Toast.svelte';

	let email    = $state('');
	let password = $state('');
	let loading  = $state(false);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		loading = true;

		const supabase = createBrowserSupabase();
		const { error } = await supabase.auth.signInWithPassword({ email, password });

		loading = false;

		if (error) {
			showToast(error.message || 'Login failed. Check your credentials.', 'error');
		} else {
			goto('/dashboard');
		}
	}
</script>

<svelte:head>
	<title>Log in — Forge</title>
</svelte:head>

<div class="min-h-screen flex bg-[var(--color-bg)]">

	<!-- ── LEFT: brand showcase panel ───────────────────────────────────────── -->
	<div class="hidden lg:flex w-[55%] relative flex-col justify-between p-12 overflow-hidden border-r border-[var(--color-border)]">
		<!-- amber glow -->
		<div class="absolute inset-0 bg-gradient-to-br from-[#f59e0b08] via-transparent to-[#f59e0b04] pointer-events-none"></div>
		<!-- dot grid -->
		<div
			class="absolute inset-0 opacity-[0.03] pointer-events-none"
			style="background-image: radial-gradient(circle, #fafaf9 1px, transparent 1px); background-size: 24px 24px;"
		></div>

		<!-- logo -->
		<div class="relative z-10 flex items-center gap-3">
			<div class="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center text-[#09090b] font-[var(--font-display)] font-bold text-lg">
				f
			</div>
			<span class="text-lg font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">forge</span>
		</div>

		<!-- headline + feature list -->
		<div class="relative z-10 space-y-10">
			<div class="space-y-4">
				<h2 class="text-4xl font-bold text-[var(--color-text)] font-[var(--font-display)] leading-tight tracking-tight">
					Build databases<br>like a designer.
				</h2>
				<p class="text-[var(--color-muted)] text-sm leading-relaxed max-w-sm font-[var(--font-ui)]">
					Visual schema design, AI-powered SQL, and real-time visualization — all in one workspace.
				</p>
			</div>

			<ul class="space-y-5">
				{#each [
					{ label: 'Canvas schema builder', desc: 'Drag tables, draw relationships, export SQL' },
					{ label: 'AI query assistant', desc: 'Ask in English, get precise SQL back instantly' },
					{ label: 'Real-time visualization', desc: 'Table + card views with custom layouts' },
				] as feat}
					<li class="flex items-start gap-3">
						<div class="mt-0.5 w-5 h-5 rounded-md bg-[var(--color-accent-glow)] border border-[var(--color-accent)]/30 flex items-center justify-center shrink-0">
							<span class="text-[var(--color-accent)] text-[10px] font-bold">✓</span>
						</div>
						<div>
							<p class="text-sm font-semibold text-[var(--color-text)] font-[var(--font-ui)]">{feat.label}</p>
							<p class="text-xs text-[var(--color-muted)] font-[var(--font-ui)]">{feat.desc}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>

		<!-- footer note -->
		<p class="relative z-10 text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
			Free, open source, powered by Supabase.
		</p>
	</div>

	<!-- ── RIGHT: form panel ─────────────────────────────────────────────────── -->
	<div class="flex-1 flex items-center justify-center px-8 py-12">
		<div class="w-full max-w-sm animate-fade-up">

			<!-- mobile logo -->
			<div class="flex items-center gap-2 mb-8 lg:hidden">
				<div class="w-8 h-8 rounded-xl bg-[var(--color-accent)] flex items-center justify-center text-[#09090b] font-[var(--font-display)] font-bold text-base">
					f
				</div>
				<span class="text-base font-bold text-[var(--color-text)] font-[var(--font-display)]">forge</span>
			</div>

			<div class="mb-8">
				<h1 class="text-2xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">Welcome back</h1>
				<p class="text-sm text-[var(--color-muted)] mt-1 font-[var(--font-ui)]">Log in to your forge workspace</p>
			</div>

			<form onsubmit={handleLogin} class="flex flex-col gap-4">
				<Input label="Email" type="email" placeholder="you@example.com" bind:value={email} />
				<Input label="Password" type="password" placeholder="••••••••" bind:value={password} />

				<Button type="submit" variant="primary" size="lg" disabled={loading} class="w-full mt-2 justify-center">
					{#snippet children()}{loading ? 'Logging in...' : 'Log in'}{/snippet}
				</Button>
			</form>

			<p class="mt-6 text-center text-sm text-[var(--color-muted)] font-[var(--font-ui)]">
				Don't have an account?
				<a href="/signup" class="text-[var(--color-accent)] hover:underline ml-1">Create one</a>
			</p>

			<p class="mt-4 text-center text-xs text-[var(--color-muted)]/60 font-[var(--font-ui)]">
				<a href="/" class="hover:text-[var(--color-muted)] transition-colors">← Back to homepage</a>
			</p>
		</div>
	</div>
</div>

<Toast />
