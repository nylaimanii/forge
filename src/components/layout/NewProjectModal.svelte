<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Modal from '$components/ui/Modal.svelte';
	import Input from '$components/ui/Input.svelte';
	import Button from '$components/ui/Button.svelte';
	import { showToast } from '$lib/stores/toasts';

	interface Props {
		open:     boolean;
		onclose?: () => void;
	}

	let { open = $bindable(false), onclose }: Props = $props();

	// ── form state ──────────────────────────────────────────────────────────────
	const COLOR_PRESETS = [
		'#6c63ff', // indigo (default)
		'#00f5d4', // cyan-mint
		'#ff4d6d', // coral
		'#ffb84d', // amber
		'#7dd87d', // mint
		'#b784ff', // violet
	];

	let name        = $state('');
	let color       = $state(COLOR_PRESETS[0]);
	let serverError = $state('');
	let submitting  = $state(false);

	// derived: submit is only enabled when name has content
	let canSubmit = $derived(name.trim().length > 0 && !submitting);

	// reset state when the modal opens
	$effect(() => {
		if (open) {
			name        = '';
			color       = COLOR_PRESETS[0];
			serverError = '';
			submitting  = false;
		}
	});

	function close() {
		onclose?.();
	}

	// use:enhance callback — runs after the server action resolves
	function handleEnhance() {
		submitting  = true;
		serverError = '';

		return async ({ result }: { result: import('@sveltejs/kit').ActionResult }) => {
			submitting = false;

			if (result.type === 'success' && result.data?.project) {
				showToast('project created', 'success');
				close();
				goto(`/project/${result.data.project.id}/schema`);
			} else if (result.type === 'failure') {
				serverError = (result.data?.error as string) ?? 'something went wrong';
			} else if (result.type === 'error') {
				serverError = 'unexpected error — try again';
			}
		};
	}
</script>

<Modal {open} onclose={close}>
	{#snippet children()}
		<!-- custom header (Modal's built-in title slot uses smaller text; we want syne) -->
		<div class="flex items-center justify-between -mt-1 mb-5">
			<h2 class="text-lg font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">
				new project
			</h2>
			<button
				onclick={close}
				class="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-md hover:bg-white/5"
				aria-label="Close"
				type="button"
			>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
		</div>

		<!-- form posts to the (app)/+page.server.ts createProject action -->
		<form
			method="POST"
			action="?/createProject"
			use:enhance={handleEnhance}
			class="flex flex-col gap-5"
		>
			<!-- hidden color value -->
			<input type="hidden" name="color" value={color} />

			<!-- project name -->
			<Input
				label="name"
				name="name"
				placeholder="my new project"
				bind:value={name}
				autofocus={open}
				error={serverError}
			/>

			<!-- color picker -->
			<div class="flex flex-col gap-2">
				<p class="text-xs font-medium text-[var(--color-muted)] uppercase tracking-wider font-[var(--font-ui)]">
					color
				</p>
				<div class="flex items-center gap-2.5">
					{#each COLOR_PRESETS as preset}
						<button
							type="button"
							onclick={() => (color = preset)}
							class="
								w-7 h-7 rounded-full transition-all duration-150
								focus-visible:outline-none
								{color === preset
									? 'ring-2 ring-offset-2 ring-offset-[var(--color-surface-1)] ring-[var(--color-accent)] scale-110'
									: 'hover:scale-110 hover:ring-1 hover:ring-white/30'
								}
							"
							style="background: {preset}; box-shadow: 0 0 8px {preset}60"
							aria-label="Select color {preset}"
							aria-pressed={color === preset}
						></button>
					{/each}
				</div>
			</div>

			<!-- footer row -->
			<div class="flex items-center justify-end gap-3 pt-1">
				<Button type="button" variant="ghost" size="sm" onclick={close}>
					{#snippet children()}cancel{/snippet}
				</Button>
				<Button type="submit" variant="primary" size="sm" disabled={!canSubmit}>
					{#snippet children()}
						{submitting ? 'creating...' : 'create project'}
					{/snippet}
				</Button>
			</div>
		</form>
	{/snippet}
</Modal>
