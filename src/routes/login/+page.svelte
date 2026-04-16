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
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>Log in — Forge</title>
</svelte:head>

<!-- full-page centered layout, no sidebar/topbar -->
<div class="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4">

	<!-- subtle gradient mesh in background -->
	<div class="fixed inset-0 gradient-mesh opacity-60 pointer-events-none"></div>

	<!-- glass card -->
	<div class="relative z-10 w-full max-w-sm animate-fade-up">
		<div class="glass rounded-2xl px-8 py-10 shadow-2xl shadow-black/50">

			<!-- logo -->
			<div class="flex flex-col items-center gap-3 mb-8">
				<div class="w-11 h-11 rounded-xl bg-[var(--color-accent)] flex items-center justify-center text-white font-[var(--font-display)] font-bold text-xl shadow-[0_0_24px_var(--color-accent-glow)]">
					f
				</div>
				<div class="text-center">
					<h1 class="text-xl font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">Welcome back</h1>
					<p class="text-xs text-[var(--color-muted)] mt-0.5 font-[var(--font-ui)]">Log in to your forge workspace</p>
				</div>
			</div>

			<!-- form -->
			<form onsubmit={handleLogin} class="flex flex-col gap-4">
				<Input
					label="Email"
					type="email"
					placeholder="you@example.com"
					bind:value={email}
				/>
				<Input
					label="Password"
					type="password"
					placeholder="••••••••"
					bind:value={password}
				/>

				<Button type="submit" variant="primary" size="lg" disabled={loading} class="w-full mt-2 justify-center">
					{#snippet children()}
						{loading ? 'Logging in...' : 'Log in'}
					{/snippet}
				</Button>
			</form>

			<!-- signup link -->
			<p class="mt-6 text-center text-xs text-[var(--color-muted)] font-[var(--font-ui)]">
				Don't have an account?
				<a href="/signup" class="text-[var(--color-accent)] hover:underline ml-1">Create one</a>
			</p>
		</div>
	</div>
</div>

<!-- toast container (works on public pages too) -->
<Toast />
