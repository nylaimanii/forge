<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createBrowserSupabase } from '$lib/supabase';

	let newPassword     = $state('');
	let confirmPassword = $state('');
	let loading         = $state(false);
	let errorMsg        = $state('');
	let tokenChecked    = $state(false);
	let tokenValid      = $state(false);
	let successMsg      = $state('');

	onMount(async () => {
		const supabase = createBrowserSupabase();
		const { data: { session } } = await supabase.auth.getSession();
		tokenValid   = !!session;
		tokenChecked = true;
	});

	async function handleUpdate(e: SubmitEvent) {
		e.preventDefault();
		errorMsg = '';

		if (newPassword.length < 8) {
			errorMsg = 'password must be at least 8 characters';
			return;
		}
		if (newPassword !== confirmPassword) {
			errorMsg = "passwords don't match";
			return;
		}

		loading = true;
		try {
			const supabase = createBrowserSupabase();
			const { error } = await supabase.auth.updateUser({ password: newPassword });

			if (error) {
				errorMsg = error.message || 'could not update password — try again';
			} else {
				successMsg = 'password updated — taking you to your dashboard';
				setTimeout(() => goto('/dashboard'), 2000);
			}
		} catch {
			errorMsg = "can't connect right now — try again in a moment";
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Reset password — Forge</title>
</svelte:head>

<div class="min-h-screen flex bg-[var(--color-bg)]">

	<!-- ── LEFT: brand panel ─────────────────────────────────────────────────── -->
	<div class="hidden lg:flex w-[55%] relative flex-col justify-between p-14 bg-[var(--color-surface-1)] border-r border-[var(--color-border)] overflow-hidden">
		<div
			class="absolute inset-0 pointer-events-none"
			style="background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 22px 22px;"
		></div>
		<div class="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-electric)] opacity-[0.04] blur-[100px] pointer-events-none"></div>

		<div class="relative z-10 flex items-center gap-3">
			<div class="w-[18px] h-[18px] rounded bg-[var(--color-electric)] flex items-center justify-center text-white font-[var(--font-display)] font-bold text-[10px]">
				f
			</div>
			<span class="font-[var(--font-display)] font-semibold text-[var(--color-text)] text-sm tracking-tight">forge</span>
		</div>

		<div class="relative z-10 max-w-sm">
			<blockquote class="font-[var(--font-display)] font-bold text-[var(--color-text)] leading-tight tracking-tight" style="font-size: 36px;">
				"set a new password and get
				<em class="text-[var(--color-electric)] not-italic">back to building.</em>"
			</blockquote>
		</div>

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

			{#if !tokenChecked}
				<!-- mount-time loading -->
				<div class="flex items-center justify-center h-40 text-[var(--color-muted)]">
					<svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
						<path d="M12 2a10 10 0 0 1 10 10"/>
					</svg>
				</div>
			{:else if !tokenValid}
				<!-- invalid / expired link -->
				<div class="text-center animate-fade-up space-y-4">
					<div class="w-14 h-14 rounded-full bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30 flex items-center justify-center text-[var(--color-danger)] text-2xl mx-auto">
						!
					</div>
					<h2 class="font-[var(--font-display)] font-bold text-[var(--color-text)] text-xl">link expired</h2>
					<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] leading-relaxed">
						this link has expired or is invalid — request a new one
					</p>
					<a href="/forgot-password" class="inline-block text-sm text-[var(--color-electric)] hover:underline font-[var(--font-ui)] mt-2">
						request a new link →
					</a>
				</div>
			{:else if successMsg}
				<!-- success state -->
				<div class="text-center animate-fade-up space-y-4">
					<div class="w-14 h-14 rounded-full bg-[var(--color-electric-dim)] border border-[var(--color-electric)]/30 flex items-center justify-center text-[var(--color-electric)] text-2xl mx-auto">
						✓
					</div>
					<h2 class="font-[var(--font-display)] font-bold text-[var(--color-text)] text-xl">all set</h2>
					<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] leading-relaxed">
						{successMsg}
					</p>
				</div>
			{:else}
				<h1 class="font-[var(--font-display)] font-bold text-[var(--color-text)] mb-1" style="font-size: 28px;">reset password</h1>
				<p class="font-[var(--font-ui)] text-[var(--color-muted)] text-sm mb-8">choose a new password for your account</p>

				<form onsubmit={handleUpdate} class="flex flex-col gap-4">
					<div class="flex flex-col gap-1.5">
						<label class="font-[var(--font-ui)] text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">New password</label>
						<input
							type="password"
							placeholder="at least 8 characters"
							bind:value={newPassword}
							class="w-full h-11 rounded-lg px-3 text-sm
								bg-[var(--color-surface-3)] text-[var(--color-text)]
								border border-[var(--color-border)]
								font-[var(--font-body)]
								placeholder:text-[var(--color-muted)]
								focus:outline-none focus:border-[var(--color-electric)] focus:shadow-[0_0_0_3px_var(--color-electric-glow)]
								transition-all duration-150"
						/>
					</div>

					<div class="flex flex-col gap-1.5">
						<label class="font-[var(--font-ui)] text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider">Confirm password</label>
						<input
							type="password"
							placeholder="re-enter password"
							bind:value={confirmPassword}
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
							disabled:opacity-40 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2"
					>
						{#if loading}
							<svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
								<circle cx="12" cy="12" r="10" stroke-opacity=".25"/>
								<path d="M12 2a10 10 0 0 1 10 10"/>
							</svg>
							updating...
						{:else}
							update password
						{/if}
					</button>

					{#if errorMsg}
						<div class="p-3 rounded-lg bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/30">
							<p class="text-xs text-[var(--color-danger)] font-[var(--font-body)]">{errorMsg}</p>
						</div>
					{/if}
				</form>

				<p class="mt-6 text-center">
					<a href="/login" class="font-[var(--font-body)] text-[11px] text-[var(--color-muted)]/50 hover:text-[var(--color-muted)] transition-colors">← back to login</a>
				</p>
			{/if}
		</div>
	</div>
</div>
