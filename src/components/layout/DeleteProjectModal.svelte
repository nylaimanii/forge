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
		projectName:  string;
		onclose?:     () => void;
	}

	let {
		open        = $bindable(false),
		projectId,
		projectName,
		onclose,
	}: Props = $props();

	let confirmation = $state('');
	let serverError  = $state('');
	let submitting   = $state(false);

	// reset state whenever the modal opens
	$effect(() => {
		if (open) {
			confirmation = '';
			serverError  = '';
			submitting   = false;
		}
	});

	// delete only enabled when the typed name matches exactly
	let canDelete = $derived(confirmation === projectName && !submitting);

	function close() {
		onclose?.();
	}

	function handleEnhance() {
		submitting  = true;
		serverError = '';

		return async ({ result }: { result: import('@sveltejs/kit').ActionResult }) => {
			submitting = false;

			if (result.type === 'success') {
				showToast('project deleted', 'success');
				await invalidateAll();
				close();
			} else if (result.type === 'failure') {
				serverError = (result.data?.error as string) ?? 'delete failed';
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
			<h2 class="text-lg font-bold text-[var(--color-danger)] font-[var(--font-display)] tracking-tight">
				delete project
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

		<!-- warning body -->
		<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)] mb-5 leading-relaxed">
			this will permanently delete
			<span class="text-[var(--color-text)] font-medium">'{projectName}'</span>
			and all its tables, whiteboards, card configs, and query history.
			<span class="text-[var(--color-danger)]">this cannot be undone.</span>
		</p>

		<form method="POST" action="?/deleteProject" use:enhance={handleEnhance} class="flex flex-col gap-5">
			<input type="hidden" name="id" value={projectId} />

			<!-- confirmation input -->
			<Input
				label="type the project name to confirm"
				name="confirmation"
				placeholder={projectName}
				bind:value={confirmation}
				error={serverError}
			/>

			<div class="flex items-center justify-end gap-3 pt-1">
				<Button type="button" variant="ghost" size="sm" onclick={close}>
					{#snippet children()}cancel{/snippet}
				</Button>
				<Button type="submit" variant="danger" size="sm" disabled={!canDelete}>
					{#snippet children()}{submitting ? 'deleting...' : 'delete project'}{/snippet}
				</Button>
			</div>
		</form>
	{/snippet}
</Modal>
