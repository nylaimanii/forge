<script lang="ts">
	import { goto } from '$app/navigation';
	import { createBrowserSupabase } from '$lib/supabase';
	import { showToast } from '$lib/stores/toasts';
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

	<!-- ── LEFT: brand panel ─────────────────────────────────────────────────── -->
	<div class="hidden lg:flex w-[55%] relative flex-col justify-between p-14 bg-[var(--color-surface-1)] border-r border-[var(--color-border)] overflow-hidden">
		<!-- dot grid -->
		<div
			class="absolute inset-0 pointer-events-none"
			style="background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 22px 22px;"
		></div>
		<!-- electric glow -->
		<div class="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-electric)] opacity-[0.04] blur-[100px] pointer-events-none"></div>

		<!-- logo -->
		<div class="relative z-10 flex items-center gap-3">
			<div class="w-[18px] h-[18px] rounded bg-[var(--color-electric)] flex items-center justify-center text-white font-[var(--font-display)] font-bold text-[10px]">
				f
			</div>
			<span class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-sm tracking-tight">forge</span>
		</div>

		<!-- center quote -->
		<div class="relative z-10 max-w-sm">
			<blockquote class="font-[var(--font-display)] font-bold text-[var(--color-text)] leading-tight tracking-tight" style="font-size: 36px;">
				"the database builder for developers who care about
				<em class="text-[var(--color-electric)] not-italic">design.</em>"
			</blockquote>
		</div>

		<!-- pills -->
		<div class="relative z-10 flex items-center gap-3 flex-wrap">
			{#each ['visual schema', 'ai queries', 'data cards'] as pill}
				<span class="inline-flex items-center px-3 py-1 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] font-[var(--font-body)] text-[10px] text-[var(--color-muted)]">
					{pill}
				</span>
			{/each}
		</div>
	</div>

	<!-- ── RIGHT: form panel ─────────────────────────────────────────────────── -->
	<div class="flex-1 flex items-center justify-center px-8 py-12 bg-[var(--color-bg)]">
		<div class="w-full max-w-sm animate-fade-up">

			<!-- mobile logo -->
			<div class="flex items-center gap-2 mb-10 lg:hidden">
				<div class="w-[18px] h-[18px] rounded bg-[var(--color-electric)] flex items-center justify-center text-white font-[var(--font-display)] font-bold text-[10px]">f</div>
				<span class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-sm">forge</span>
			</div>

			<h1 class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-1" style="font-size: 28px;">welcome back</h1>
			<p class="font-[var(--font-ui)] text-[var(--color-muted)] text-sm mb-8">log in to your workspace</p>

			<form onsubmit={handleLogin} class="flex flex-col gap-4">
				<!-- email -->
				<div class="flex flex-col gap-1.5">
					<label class="font-[var(--font-ui)] text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">Email</label>
					<input
						type="email"
						placeholder="you@example.com"
						bind:value={email}
						class="w-full h-11 rounded-lg px-3 text-sm
							bg-[var(--color-surface-3)] text-[var(--color-text)]
							border border-[var(--color-border)]
							font-[var(--font-body)]
							placeholder:text-[var(--color-muted)]
							focus:outline-none focus:border-[var(--color-electric)] focus:shadow-[0_0_0_3px_var(--color-electric-glow)]
							transition-all duration-150"
					/>
				</div>

				<!-- password -->
				<div class="flex flex-col gap-1.5">
					<label class="font-[var(--font-ui)] text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">Password</label>
					<input
						type="password"
						placeholder="••••••••"
						bind:value={password}
						class="w-full h-11 rounded-lg px-3 text-sm
							bg-[var(--color-surface-3)] text-[var(--color-text)]
							border border-[var(--color-border)]
							font-[var(--font-body)]
							placeholder:text-[var(--color-muted)]
							focus:outline-none focus:border-[var(--color-electric)] focus:shadow-[0_0_0_3px_var(--color-electric-glow)]
							transition-all duration-150"
					/>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="w-full h-12 rounded-lg bg-[var(--color-accent)] text-[#05050a] font-[var(--font-display)] font-semibold text-sm
						hover:bg-white hover:shadow-lg transition-all duration-150
						disabled:opacity-40 disabled:pointer-events-none mt-2"
				>
					{loading ? 'logging in...' : 'log in'}
				</button>
			</form>

			<p class="mt-6 text-center text-sm text-[var(--color-muted)] font-[var(--font-ui)]">
				don't have an account?
				<a href="/signup" class="text-[var(--color-electric)] hover:underline ml-1">create one</a>
			</p>
			<p class="mt-4 text-center">
				<a href="/" class="font-[var(--font-body)] text-[11px] text-[var(--color-muted)]/50 hover:text-[var(--color-muted)] transition-colors">← back to homepage</a>
			</p>
		</div>
	</div>
</div>

<Toast />
