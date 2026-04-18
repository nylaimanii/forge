<script lang="ts">
	import { enhance } from '$app/forms';
	import { Key, Trash2, X, Plus } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import { showToast } from '$lib/stores/toasts';
	import type { SchemaTable, SchemaField } from './TableCard.svelte';

	interface LocalField {
		id:          string;   // real UUID or 'new_N' for unsaved
		name:        string;
		type:        string;
		is_primary:  boolean;
		is_nullable: boolean;
		position:    number;
	}

	interface Props {
		table:    SchemaTable | null;
		onclose:  () => void;
		ondelete: (tableId: string) => void;
		onsave:   (tableId: string, fields: SchemaField[]) => void;
	}

	let { table, onclose, ondelete, onsave }: Props = $props();

	const FIELD_TYPES = ['text', 'integer', 'bigint', 'float', 'boolean', 'uuid', 'timestamptz', 'jsonb'];

	let localFields  = $state<LocalField[]>([]);
	let serverError  = $state('');
	let saving       = $state(false);
	let newFieldIdx  = $state(0); // counter for temp IDs

	// reset local fields whenever the selected table changes
	$effect(() => {
		if (table) {
			localFields = [...table.fields]
				.sort((a, b) => a.position - b.position)
				.map((f) => ({ ...f }));
			serverError = '';
			newFieldIdx = 0;
		}
	});

	function addField() {
		localFields = [
			...localFields,
			{
				id:          `new_${++newFieldIdx}`,
				name:        `field_${localFields.length + 1}`,
				type:        'text',
				is_primary:  false,
				is_nullable: true,
				position:    localFields.length,
			},
		];
	}

	function removeField(id: string) {
		localFields = localFields.filter((f) => f.id !== id);
	}

	function togglePrimary(id: string) {
		localFields = localFields.map((f) =>
			f.id === id ? { ...f, is_primary: !f.is_primary, is_nullable: f.is_primary ? f.is_nullable : false } : f
		);
	}

	function toggleNullable(id: string) {
		localFields = localFields.map((f) =>
			f.id === id && !f.is_primary ? { ...f, is_nullable: !f.is_nullable } : f
		);
	}

	function updateField(id: string, key: 'name' | 'type', value: string) {
		localFields = localFields.map((f) => f.id === id ? { ...f, [key]: value } : f);
	}

	// use:enhance handler for the save form
	function handleSave() {
		saving      = true;
		serverError = '';

		return async ({ result }: { result: import('@sveltejs/kit').ActionResult }) => {
			saving = false;
			if (result.type === 'success' && result.data?.fields) {
				showToast('schema saved', 'success');
				onsave(table!.id, result.data.fields as SchemaField[]);
			} else if (result.type === 'failure') {
				serverError = (result.data?.error as string) ?? 'save failed';
			} else if (result.type === 'error') {
				serverError = 'unexpected error — try again';
			}
		};
	}
</script>

<!--
	fixed right panel — slides in/out depending on whether a table is selected.
	top: topbar (3.5rem) + tab bar (3rem) = 6.5rem
-->
<aside
	class="
		fixed right-0 top-[6.5rem] bottom-0 w-[280px] z-10
		glass border-l border-[var(--color-border)]
		flex flex-col
		transition-transform duration-200 ease-out
		{table ? 'translate-x-0' : 'translate-x-full'}
	"
>
	{#if table}
		<!-- panel header -->
		<div class="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border)] shrink-0">
			<h3 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)] flex-1 truncate">
				{table.name}
			</h3>

			<!-- delete table -->
			<button
				type="button"
				onclick={() => ondelete(table!.id)}
				class="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-glow)] transition-all"
				aria-label="Delete table"
				title="Delete table"
			>
				<Trash2 size={13} />
			</button>

			<!-- close panel -->
			<button
				type="button"
				onclick={onclose}
				class="w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5 transition-all"
				aria-label="Close editor"
			>
				<X size={13} />
			</button>
		</div>

		<!-- field list (scrollable) -->
		<div class="flex-1 overflow-y-auto py-2 px-3 flex flex-col gap-1">
			{#each localFields as field (field.id)}
				<div class="flex flex-col gap-1 py-2 border-b border-[var(--color-border)]/50">

					<!-- name + delete row -->
					<div class="flex items-center gap-1.5">
						<input
							type="text"
							value={field.name}
							oninput={(e) => updateField(field.id, 'name', (e.target as HTMLInputElement).value)}
							class="
								flex-1 text-xs bg-[var(--color-surface-2)] text-[var(--color-text)]
								border border-[var(--color-border)] rounded-md px-2 py-1
								font-[var(--font-body)] focus:outline-none focus:border-[var(--color-accent)]
								transition-colors
							"
							placeholder="field name"
						/>
						<button
							type="button"
							onclick={() => removeField(field.id)}
							class="w-6 h-6 flex items-center justify-center rounded text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors shrink-0"
							aria-label="Remove field"
						>
							<Trash2 size={11} />
						</button>
					</div>

					<!-- type select + toggles row -->
					<div class="flex items-center gap-1.5">
						<select
							value={field.type}
							onchange={(e) => updateField(field.id, 'type', (e.target as HTMLSelectElement).value)}
							class="
								flex-1 text-xs bg-[var(--color-surface-2)] text-[var(--color-text)]
								border border-[var(--color-border)] rounded-md px-2 py-1
								font-[var(--font-body)] focus:outline-none focus:border-[var(--color-accent)]
								transition-colors cursor-pointer
							"
						>
							{#each FIELD_TYPES as t}
								<option value={t} selected={field.type === t}>{t}</option>
							{/each}
						</select>

						<!-- primary key toggle -->
						<button
							type="button"
							onclick={() => togglePrimary(field.id)}
							class="
								w-6 h-6 flex items-center justify-center rounded transition-all shrink-0
								{field.is_primary
									? 'text-[var(--color-accent)] bg-[var(--color-accent-glow)]'
									: 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
								}
							"
							aria-label="Toggle primary key"
							title="Primary key"
						>
							<Key size={11} />
						</button>

						<!-- nullable toggle -->
						<button
							type="button"
							onclick={() => toggleNullable(field.id)}
							disabled={field.is_primary}
							class="
								w-6 h-6 flex items-center justify-center rounded text-[9px] font-bold
								font-[var(--font-body)] transition-all shrink-0
								{field.is_nullable && !field.is_primary
									? 'text-[var(--color-cyan)] bg-[var(--color-cyan-glow)]'
									: 'text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30'
								}
							"
							aria-label="Toggle nullable"
							title={field.is_nullable ? 'nullable' : 'not null'}
						>
							?
						</button>
					</div>
				</div>
			{/each}

			<!-- add field button -->
			<button
				type="button"
				onclick={addField}
				class="flex items-center gap-1.5 w-full py-2 text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors font-[var(--font-ui)] mt-1"
			>
				<Plus size={12} />
				add field
			</button>
		</div>

		<!-- save footer -->
		<div class="shrink-0 px-3 py-3 border-t border-[var(--color-border)]">
			{#if serverError}
				<p class="text-xs text-[var(--color-danger)] mb-2 font-[var(--font-ui)]">{serverError}</p>
			{/if}

			<form method="POST" action="?/saveFields" use:enhance={handleSave}>
				<input type="hidden" name="table_id" value={table.id} />
				<input type="hidden" name="fields" value={JSON.stringify(
					localFields.map(({ id: _id, ...rest }) => rest)
				)} />

				<Button type="submit" variant="primary" size="sm" disabled={saving} class="w-full justify-center">
					{#snippet children()}{saving ? 'saving...' : 'save changes'}{/snippet}
				</Button>
			</form>
		</div>
	{/if}
</aside>
