<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Modal from '$components/ui/Modal.svelte';
	import Input from '$components/ui/Input.svelte';
	import Button from '$components/ui/Button.svelte';
	import { showToast } from '$lib/stores/toasts';

	interface Props {
		open:         boolean;
		projectId:    string;
		currentName:  string;
		onclose?:     () => void;
	}

	let {
		open        = $bindable(false),
		projectId,
		currentName,
		onclose,
	}: Props = $props();

	let name        = $state('');
	let serverError = $state('');
	let submitting  = $state(false);

	// prefill and select-all whenever the modal opens
	$effect(() => {
		if (open) {
			name        = currentName;
			serverError = '';
			submitting  = false;
			// select all text in the name input after the DOM settles
			setTimeout(() => {
				const input = document.querySelector<HTMLInputElement>('input[name="name"]');
				input?.select();
			}, 60);
		}
	});

	// save is disabled when name is blank or hasn't changed
	let canSave = $derived(name.trim().length > 0 && name.trim() !== currentName.trim() && !submitting);

	function close() {
		onclose?.();
	}

	function handleEnhance() {
		submitting  = true;
		serverError = '';

		return async ({ result }: { result: import('@sveltejs/kit').ActionResult }) => {
			submitting = false;

			if (result.type === 'success') {
				showToast('project renamed', 'success');
				await invalidateAll();
				close();
			} else if (result.type === 'failure') {
				serverError = (result.data?.error as string) ?? 'rename failed';
			} else if (result.type === 'error') {
				serverError = 'unexpected error — try again';
			}
		};
	}
</script>

<Modal {open} onclose={close}>
	{#snippet children()}
		<!-- header -->
		<div class="flex items-center justify-between -mt-1 mb-5">
			<h2 class="text-lg font-bold text-[var(--color-text)] font-[var(--font-display)] tracking-tight">
				rename project
			</h2>
			<button
				type="button"
				onclick={close}
				class="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1 rounded-md hover:bg-white/5"
				aria-label="Close"
			>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
					<path d="M1 1l12 12M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
		</div>

		<form method="POST" action="?/renameProject" use:enhance={handleEnhance} class="flex flex-col gap-5">
			<input type="hidden" name="id" value={projectId} />

			<Input
				label="name"
				name="name"
				placeholder="project name"
				bind:value={name}
				error={serverError}
			/>

			<div class="flex items-center justify-end gap-3 pt-1">
				<Button type="button" variant="ghost" size="sm" onclick={close}>
					{#snippet children()}cancel{/snippet}
				</Button>
				<Button type="submit" variant="primary" size="sm" disabled={!canSave}>
					{#snippet children()}{submitting ? 'saving...' : 'save'}{/snippet}
				</Button>
			</div>
		</form>
	{/snippet}
</Modal>
