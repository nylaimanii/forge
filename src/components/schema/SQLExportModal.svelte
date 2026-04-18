<script lang="ts">
	import { Check, Copy } from 'lucide-svelte';
	import Modal from '$components/ui/Modal.svelte';
	import type { SchemaTable } from './TableCard.svelte';

	interface Relationship {
		id:            string;
		from_table_id: string;
		from_field_id: string;
		to_table_id:   string;
		to_field_id:   string;
		relation_type: string;
	}

	interface Props {
		open:          boolean;
		tables:        SchemaTable[];
		relationships: Relationship[];
		onclose:       () => void;
	}

	let { open, tables, relationships, onclose }: Props = $props();

	// ── pg type map ───────────────────────────────────────────────────────────
	const PG_TYPE: Record<string, string> = {
		text:        'text',
		integer:     'integer',
		bigint:      'bigint',
		float:       'double precision',
		boolean:     'boolean',
		uuid:        'uuid',
		timestamptz: 'timestamptz',
		jsonb:       'jsonb',
	};

	// ── SQL generation ────────────────────────────────────────────────────────
	let sql = $derived(generateSQL(tables, relationships));

	function generateSQL(tbls: SchemaTable[], rels: Relationship[]): string {
		if (tbls.length === 0) return '-- no tables defined';

		const lines: string[] = [];

		for (const table of tbls) {
			const sorted = [...table.fields].sort((a, b) => a.position - b.position);
			lines.push(`create table if not exists ${ident(table.name)} (`);

			const cols: string[] = sorted.map((f) => {
				const pg   = PG_TYPE[f.type] ?? f.type;
				const pk   = f.is_primary  ? ' primary key' : '';
				const nul  = !f.is_primary && f.is_nullable ? '' : ' not null';
				return `  ${ident(f.name)} ${pg}${pk}${nul}`;
			});

			// FK constraints for this table
			const fks = rels
				.filter((r) => r.from_table_id === table.id)
				.flatMap((r) => {
					const fromField = table.fields.find((f) => f.id === r.from_field_id);
					const toTable   = tbls.find((t) => t.id === r.to_table_id);
					const toField   = toTable?.fields.find((f) => f.id === r.to_field_id);
					if (!fromField || !toTable || !toField) return [];
					return [
						`  foreign key (${ident(fromField.name)}) references ${ident(toTable.name)}(${ident(toField.name)})`,
					];
				});

			lines.push([...cols, ...fks].join(',\n'));
			lines.push(`);\n`);
		}

		return lines.join('\n');
	}

	function ident(name: string): string {
		// quote identifiers that need it
		return /^[a-z_][a-z0-9_]*$/i.test(name) ? name : `"${name}"`;
	}

	// ── copy to clipboard ─────────────────────────────────────────────────────
	let copied = $state(false);

	async function handleCopy() {
		await navigator.clipboard.writeText(sql);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<Modal {open} title="export SQL" onclose={onclose}>
	{#snippet children()}
		<div class="flex flex-col gap-3">
			<!-- copy button -->
			<div class="flex justify-end">
				<button
					type="button"
					onclick={handleCopy}
					class="
						flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs
						font-[var(--font-ui)] transition-all
						{copied
							? 'text-[var(--color-cyan)] bg-[var(--color-cyan-glow)]'
							: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
						}
					"
				>
					{#if copied}
						<Check size={12} />
						copied!
					{:else}
						<Copy size={12} />
						copy
					{/if}
				</button>
			</div>

			<!-- SQL block -->
			<pre
				class="
					text-xs font-[var(--font-body)] leading-relaxed
					bg-[var(--color-surface-2)] border border-[var(--color-border)]
					rounded-xl p-4 overflow-x-auto overflow-y-auto
					text-[var(--color-text)] whitespace-pre
					max-h-[60vh]
				"
			>{sql}</pre>
		</div>
	{/snippet}
</Modal>
