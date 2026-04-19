<script lang="ts">
	import Modal from '$components/ui/Modal.svelte';

	interface Props {
		open: boolean;
		onclose?: () => void;
	}

	let { open, onclose }: Props = $props();

	const shortcuts = [
		{ keys: ['⌘', 'K'],    desc: 'open command palette'   },
		{ keys: ['⌘', '↵'],    desc: 'run SQL query'           },
		{ keys: ['Esc'],        desc: 'close modal / cancel'   },
		{ keys: ['?'],          desc: 'show keyboard shortcuts' },
		{ keys: ['G', 'D'],    desc: 'go to dashboard'         },
		{ keys: ['G', 'S'],    desc: 'go to schema'            },
		{ keys: ['G', 'Q'],    desc: 'go to SQL editor'        },
		{ keys: ['G', 'A'],    desc: 'go to AI mode'           },
		{ keys: ['G', 'V'],    desc: 'go to visualize'         },
		{ keys: ['G', 'W'],    desc: 'open whiteboard'         },
	];
</script>

<Modal {open} title="keyboard shortcuts" onclose={onclose}>
	{#snippet children()}
		<table class="w-full text-sm border-collapse">
			<thead>
				<tr>
					<th class="text-left text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] pb-3 pr-6">shortcut</th>
					<th class="text-left text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] pb-3">action</th>
				</tr>
			</thead>
			<tbody>
				{#each shortcuts as s, i}
					<tr class="{i % 2 === 0 ? '' : 'bg-white/[0.02]'} rounded">
						<td class="py-2 pr-6">
							<div class="flex items-center gap-1">
								{#each s.keys as key}
									<kbd class="inline-flex items-center justify-center rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1.5 py-0.5 text-xs font-[var(--font-body)] text-[var(--color-text)]">{key}</kbd>
								{/each}
							</div>
						</td>
						<td class="py-2 text-sm font-[var(--font-ui)] text-[var(--color-muted)]">{s.desc}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/snippet}
</Modal>
