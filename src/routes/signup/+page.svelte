<script lang="ts">
	import { createBrowserSupabase } from '$lib/supabase';
	import { showToast } from '$lib/stores/toasts';
	import Button from '$components/ui/Button.svelte';
	import Input from '$components/ui/Input.svelte';
	import Toast from '$components/ui/Toast.svelte';

	let email     = $state('');
	let password  = $state('');
	let loading   = $state(false);
	let confirmed = $state(false); // show confirmation message after signup

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

<div class="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">
	<div class="fixed inset-0 gradient-mesh opacity-60 pointer-events-none"></div>

	<div class="relative z-10 w-full max-w-sm animate-fade-up">
		<div class="glass rounded-2xl px-8 py-10 shadow-2xl shadow-black/50">

			<!-- logo -->
			<div class="flex flex-col items-center gap-3 mb-8">
				<div class="w-11 h-11 rounded-xl bg-[var(--color-accent)] flex items-center justify-center text-white font-[var(--font-display)] font-bold text-xl shadow-[0_0_24px_var(--color-accent-glow)]">
					f
				</div>
				<div class="text-center">
					<h1 class="text-xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">Create your account</h1>
					<p class="text-xs text-[var(--color-muted)] mt-0.5 font-[var(--font-ui)]">Start building with forge — free, forever</p>
				</div>
			</div>

			{#if confirmed}
				<!-- post-signup confirmation state -->
				<div class="flex flex-col items-center gap-3 py-4 text-center animate-fade-up">
					<div class="w-12 h-12 rounded-full bg-[var(--color-cyan-glow)] border border-[var(--color-cyan)]/30 flex items-center justify-center text-[var(--color-cyan)] text-xl">
						✓
					</div>
					<h2 class="text-base font-semibold text-[var(--color-text)] font-[var(--font-display)]">Check your email</h2>
					<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)]">
						We sent a confirmation link to <strong class="text-[var(--color-text)]">{email}</strong>.
						Click it to activate your account, then log in.
					</p>
					<a href="/login" class="text-sm text-[var(--color-accent)] hover:underline font-[var(--font-ui)] mt-2">
						Go to login →
					</a>
				</div>
			{:else}
				<!-- signup form -->
				<form onsubmit={handleSignup} class="flex flex-col gap-4">
					<Input
						label="Email"
						type="email"
						placeholder="you@example.com"
						bind:value={email}
					/>
					<Input
						label="Password"
						type="password"
						placeholder="At least 8 characters"
						bind:value={password}
					/>

					<Button type="submit" variant="primary" size="lg" disabled={loading} class="w-full mt-2 justify-center">
						{#snippet children()}
							{loading ? 'Creating account...' : 'Create account'}
						{/snippet}
					</Button>
				</form>

				<p class="mt-6 text-center text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
					Already have an account?
					<a href="/login" class="text-[var(--color-accent)] hover:underline ml-1">Log in</a>
				</p>
			{/if}
		</div>
	</div>
</div>

<Toast />
