<script lang="ts">
	import { createBrowserSupabase } from '$lib/supabase';
	import { showToast } from '$lib/stores/toasts';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Toast from '$components/ui/Toast.svelte';

	let email     = $state('');
	let password  = $state('');
	let loading   = $state(false);
	let confirmed = $state(false);

	async function handleSignup(e: SubmitEvent) {
		e.preventDefault();
		loading = true;

		const supabase = createBrowserSupabase();
		const { error } = await supabase.auth.signUp({ email, password });

		loading = false;

		if (error) {
			showToast(error.message || 'Sign up failed. Try again.', 'error');
		} else {
			confirmed = true;
		}
	}
</script>

<svelte:head>
	<title>Create account — Forge</title>
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
			<div class="space-y:4">
				<h2 class="text-4xl font-bold text-[var(--color-text)] font-[var(--font-display)] leading-tight tracking-tight mb-4">
					Start building<br>for free.
				</h2>
				<p class="text-[var(--color-muted)] text-sm leading-relaxed max-w-sm font-[var(--font-ui)]">
					No credit card. No setup. Just a workspace that helps you ship faster.
				</p>
			</div>

			<ul class="space-y-5">
				{#each [
					{ label: 'Unlimited projects', desc: 'Create as many databases as you need' },
					{ label: 'AI-powered SQL', desc: 'Groq Llama writes queries from plain English' },
					{ label: 'Visual schema design', desc: 'Canvas-first, no raw SQL DDL required' },
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

			{#if confirmed}
				<!-- post-signup confirmation -->
				<div class="text-center animate-fade-up space-y-4">
					<div class="w-14 h-14 rounded-full bg-[var(--color-accent-glow)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] text-2xl mx-auto">
						✓
					</div>
					<h2 class="text-xl font-bold text-[var(--color-text)] font-[var(--font-display)]">Check your email</h2>
					<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] leading-relaxed">
						We sent a confirmation link to<br>
						<strong class="text-[var(--color-text)]">{email}</strong>.<br>
						Click it to activate your account, then log in.
					</p>
					<a href="/login" class="inline-block text-sm text-[var(--color-accent)] hover:underline font-[var(--font-ui)] mt-2">
						Go to login →
					</a>
				</div>
			{:else}
				<div class="mb-8">
					<h1 class="text-2xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">Create your account</h1>
					<p class="text-sm text-[var(--color-muted)] mt-1 font-[var(--font-ui)]">Start building with forge — free, forever</p>
				</div>

				<form onsubmit={handleSignup} class="flex flex-col gap-4">
					<Input label="Email" type="email" placeholder="you@example.com" bind:value={email} />
					<Input label="Password" type="password" placeholder="At least 8 characters" bind:value={password} />

					<Button type="submit" variant="primary" size="lg" disabled={loading} class="w-full mt-2 justify-center">
						{#snippet children()}{loading ? 'Creating account...' : 'Create account'}{/snippet}
					</Button>
				</form>

				<p class="mt-6 text-center text-sm text-[var(--color-muted)] font-[var(--font-ui)]">
					Already have an account?
					<a href="/login" class="text-[var(--color-accent)] hover:underline ml-1">Log in</a>
				</p>

				<p class="mt-4 text-center text-xs text-[var(--color-muted)]/60 font-[var(--font-ui)]">
					<a href="/" class="hover:text-[var(--color-muted)] transition-colors">← Back to homepage</a>
				</p>
			{/if}
		</div>
	</div>
</div>

<Toast />
