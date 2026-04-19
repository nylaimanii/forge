<script lang="ts">
	import { enhance } from '$app/forms';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { FormInput, Plus, Trash2, Eye, EyeOff, Link, GripVertical,
		Calendar, Hash, AlignLeft, ChevronDown, Upload, CheckSquare, Share2, Inbox } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import EmptyState from '$components/ui/EmptyState.svelte';
	import { showToast } from '$lib/stores/toasts';

	let { data }: { data: PageData } = $props();

	// ── state ────────────────────────────────────────────────────────────────
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let forms = $state<any[]>([...data.forms]);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let selectedForm = $state<any | null>(null);
	let previewMode  = $state(false);
	let activeTab    = $state<'builder' | 'submissions'>('builder');
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let submissions  = $state<any[]>([]);

	const FIELD_TYPES = [
		{ type: 'text',     label: 'Text',        icon: FormInput    },
		{ type: 'number',   label: 'Number',      icon: Hash         },
		{ type: 'date',     label: 'Date',        icon: Calendar     },
		{ type: 'textarea', label: 'Long text',   icon: AlignLeft    },
		{ type: 'select',   label: 'Dropdown',    icon: ChevronDown  },
		{ type: 'checkbox', label: 'Checkbox',    icon: CheckSquare  },
		{ type: 'file',     label: 'File upload', icon: Upload       },
	];

	// ── field helpers ─────────────────────────────────────────────────────────
	function addField(type: string) {
		if (!selectedForm) return;
		const newField = {
			id:          crypto.randomUUID(),
			type,
			label:       `${type} field`,
			placeholder: '',
			required:    false,
			width:       'full' as 'full' | 'half',
			options:     type === 'select' ? ['Option 1', 'Option 2'] : [],
		};
		selectedForm = { ...selectedForm, fields: [...selectedForm.fields, newField] };
	}

	function removeField(id: string) {
		if (!selectedForm) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		selectedForm = { ...selectedForm, fields: selectedForm.fields.filter((f: any) => f.id !== id) };
	}

	function updateField(id: string, key: string, value: unknown) {
		if (!selectedForm) return;
		selectedForm = {
			...selectedForm,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			fields: selectedForm.fields.map((f: any) => f.id === id ? { ...f, [key]: value } : f),
		};
	}

	function moveField(id: string, dir: -1 | 1) {
		if (!selectedForm) return;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const fields = [...selectedForm.fields] as any[];
		const idx = fields.findIndex((f) => f.id === id);
		if (idx < 0) return;
		const newIdx = idx + dir;
		if (newIdx < 0 || newIdx >= fields.length) return;
		[fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
		selectedForm = { ...selectedForm, fields };
	}

	// ── save / actions ────────────────────────────────────────────────────────
	async function saveForm() {
		if (!selectedForm) return;
		const body = new URLSearchParams({
			id:     selectedForm.id,
			title:  selectedForm.title,
			fields: JSON.stringify(selectedForm.fields),
		});
		const res = await fetch('?/saveForm', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		});
		if (res.ok) {
			showToast('form saved', 'success');
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			forms = forms.map((f: any) => f.id === selectedForm!.id ? { ...selectedForm } : f);
		}
	}

	async function togglePublic() {
		if (!selectedForm) return;
		const newVal = !selectedForm.is_public;
		const body = new URLSearchParams({ id: selectedForm.id, is_public: String(newVal) });
		await fetch('?/togglePublic', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		});
		selectedForm = { ...selectedForm, is_public: newVal };
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		forms = forms.map((f: any) => f.id === selectedForm!.id ? { ...selectedForm } : f);
		showToast(newVal ? 'form is now public' : 'form set to private', 'success');
	}

	async function loadSubmissions() {
		if (!selectedForm) return;
		const body = new URLSearchParams({ form_id: selectedForm.id });
		const res = await fetch('?/loadSubmissions', {
			method:  'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		});
		const text = await res.text();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const result = deserialize(text) as any;
		submissions = result?.data?.submissions ?? [];
	}

	function copyPublicLink() {
		if (!selectedForm) return;
		const url = `${window.location.origin}/forms/${selectedForm.id}`;
		navigator.clipboard.writeText(url);
		showToast('link copied to clipboard', 'success');
	}
</script>

<div class="flex overflow-hidden -mt-12" style="height: calc(100vh - 6.5rem);">

	<!-- ── LEFT SIDEBAR: form list ────────────────────────────────────────── -->
	<aside class="w-[220px] shrink-0 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-1)] overflow-y-auto">
		<div class="shrink-0 px-4 pt-5 pb-3 flex items-center justify-between">
			<h2 class="text-sm font-bold text-[var(--color-text)] font-[var(--font-display)]">forms</h2>
			<!-- create new form via server action -->
			<form method="POST" action="?/createForm" use:enhance={({ }) => {
				return async ({ result }) => {
					if (result.type === 'success' && result.data?.form) {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const f = result.data.form as any;
						forms = [f, ...forms];
						selectedForm = { ...f, fields: f.fields ?? [] };
					}
				};
			}}>
				<button
					type="submit"
					class="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--color-electric-dim)] text-[var(--color-electric)] hover:bg-[var(--color-electric)]/20 transition-colors"
					aria-label="New form"
				>
					<Plus size={14} />
				</button>
			</form>
		</div>

		{#if forms.length === 0}
			<p class="px-4 text-xs text-[var(--color-muted)] font-[var(--font-ui)] italic">no forms yet</p>
		{:else}
			<div class="flex flex-col gap-0.5 px-2 pb-4">
				{#each forms as form}
					{@const active = selectedForm?.id === form.id}
					<button
						type="button"
						onclick={() => { selectedForm = { ...form }; activeTab = 'builder'; }}
						class="
							flex items-center justify-between w-full px-3 py-2 rounded-lg text-left
							text-xs font-[var(--font-body)] transition-all
							{active
								? 'border-l-2 border-[var(--color-electric)] bg-[var(--color-electric-dim)] text-[var(--color-text)] pl-[10px]'
								: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
							}
						"
					>
						<span class="truncate">{form.title}</span>
						{#if form.is_public}
							<span class="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] shrink-0"></span>
						{/if}
					</button>
				{/each}
			</div>
		{/if}
	</aside>

	<!-- ── MAIN AREA ──────────────────────────────────────────────────────── -->
	<div class="flex-1 flex flex-col overflow-hidden bg-[var(--color-bg)]">
		{#if !selectedForm}
			<div class="flex items-center justify-center h-full">
				<EmptyState title="no form selected" description="create a form or select one from the left to start building">
					{#snippet icon()}<FormInput size={36} strokeWidth={1.25} />{/snippet}
				</EmptyState>
			</div>
		{:else}
			<!-- ── TOOLBAR ───────────────────────────────────────────────────── -->
			<div class="shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] flex-wrap">
				<!-- editable title -->
				<input
					type="text"
					bind:value={selectedForm.title}
					class="flex-1 min-w-24 bg-transparent text-sm font-[var(--font-display)] font-semibold text-[var(--color-text)] outline-none border-b border-transparent focus:border-[var(--color-electric)] transition-colors"
				/>

				<!-- view tabs -->
				<div class="flex items-center gap-1 shrink-0">
					<button
						onclick={() => (activeTab = 'builder')}
						class="px-3 py-1 rounded-md text-xs font-[var(--font-ui)] transition-colors {activeTab === 'builder' ? 'bg-[var(--color-electric-dim)] text-[var(--color-electric)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
					>builder</button>
					<button
						onclick={() => { activeTab = 'submissions'; loadSubmissions(); }}
						class="px-3 py-1 rounded-md text-xs font-[var(--font-ui)] transition-colors {activeTab === 'submissions' ? 'bg-[var(--color-electric-dim)] text-[var(--color-electric)]' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
					>submissions</button>
				</div>

				<!-- preview toggle -->
				<button
					onclick={() => (previewMode = !previewMode)}
					class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
				>
					{#if previewMode}<EyeOff size={12} /> edit{:else}<Eye size={12} /> preview{/if}
				</button>

				<!-- share toggle -->
				<button
					onclick={togglePublic}
					class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-[var(--font-ui)] transition-colors shrink-0 {selectedForm.is_public ? 'text-[var(--color-success)] border-[var(--color-success)]/30' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
				>
					<Share2 size={12} /> {selectedForm.is_public ? 'public' : 'share'}
				</button>

				<!-- copy link (only when public) -->
				{#if selectedForm.is_public}
					<button
						onclick={copyPublicLink}
						class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
					>
						<Link size={12} /> copy link
					</button>
				{/if}

				<Button variant="primary" size="sm" onclick={saveForm}>
					{#snippet children()}save{/snippet}
				</Button>

				<!-- delete -->
				<form method="POST" action="?/deleteForm" use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							forms = forms.filter((f: any) => f.id !== selectedForm!.id);
							selectedForm = null;
						}
					};
				}}>
					<input type="hidden" name="id" value={selectedForm.id} />
					<button type="submit" class="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors" aria-label="delete form">
						<Trash2 size={14} />
					</button>
				</form>
			</div>

			<!-- ── SUBMISSIONS TAB ────────────────────────────────────────────── -->
			{#if activeTab === 'submissions'}
				<div class="flex-1 overflow-auto p-6">
					{#if submissions.length === 0}
						<EmptyState title="no submissions yet" description="share the public link to collect responses">
							{#snippet icon()}<Inbox size={36} strokeWidth={1.25} />{/snippet}
						</EmptyState>
					{:else}
						<div class="overflow-x-auto">
							<table class="w-full text-xs font-[var(--font-body)] border-collapse">
								<thead>
									<tr>
										<th class="px-3 py-2 text-left text-[var(--color-muted)] border-b border-[var(--color-border)] text-[10px] uppercase tracking-wide">submitted</th>
										{#each selectedForm.fields as field}
											<th class="px-3 py-2 text-left text-[var(--color-muted)] border-b border-[var(--color-border)] text-[10px] uppercase tracking-wide">{field.label}</th>
										{/each}
									</tr>
								</thead>
								<tbody>
									{#each submissions as sub, i}
										<tr class={i % 2 === 0 ? '' : 'bg-white/[0.02]'}>
											<td class="px-3 py-2 text-[var(--color-muted)] border-b border-[var(--color-border)]/50">
												{new Date(sub.submitted_at).toLocaleString()}
											</td>
											{#each selectedForm.fields as field}
												<td class="px-3 py-2 text-[var(--color-text)] border-b border-[var(--color-border)]/50">
													{sub.data?.[field.id] ?? '—'}
												</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				</div>

			<!-- ── PREVIEW MODE ───────────────────────────────────────────────── -->
			{:else if previewMode}
				<div class="flex-1 overflow-auto flex items-start justify-center p-8">
					<div class="w-full max-w-xl bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-8">
						<h2 class="font-[var(--font-display)] font-bold text-xl text-[var(--color-text)] mb-6">{selectedForm.title}</h2>
						<div class="flex flex-wrap gap-4">
							{#each selectedForm.fields as field}
								<div class="{field.width === 'half' ? 'w-[calc(50%-8px)]' : 'w-full'}">
									<label class="block text-xs font-[var(--font-ui)] text-[var(--color-muted)] mb-1">
										{field.label}{#if field.required}<span class="text-[var(--color-danger)]"> *</span>{/if}
									</label>
									{#if field.type === 'textarea'}
										<textarea placeholder={field.placeholder} disabled class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] font-[var(--font-ui)] outline-none resize-none h-24"></textarea>
									{:else if field.type === 'select'}
										<select disabled class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] font-[var(--font-ui)] outline-none">
											{#each field.options ?? [] as opt}<option>{opt}</option>{/each}
										</select>
									{:else if field.type === 'checkbox'}
										<div class="flex items-center gap-2">
											<input type="checkbox" disabled class="w-4 h-4" />
											<span class="text-sm text-[var(--color-text)] font-[var(--font-ui)]">{field.placeholder || field.label}</span>
										</div>
									{:else}
										<input type={field.type} placeholder={field.placeholder} disabled class="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm text-[var(--color-text)] font-[var(--font-ui)] outline-none" />
									{/if}
								</div>
							{/each}
						</div>
						{#if selectedForm.fields.length > 0}
							<button disabled class="mt-6 w-full h-10 rounded-lg bg-[var(--color-accent)] text-[#05050a] font-[var(--font-display)] font-semibold text-sm opacity-60">submit</button>
						{/if}
					</div>
				</div>

			<!-- ── BUILDER MODE ───────────────────────────────────────────────── -->
			{:else}
				<div class="flex-1 flex overflow-hidden">
					<!-- field type palette -->
					<div class="w-44 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface-1)] p-3 overflow-y-auto">
						<p class="text-[10px] uppercase tracking-widest text-[var(--color-muted)] font-[var(--font-ui)] mb-2">add field</p>
						<div class="flex flex-col gap-1">
							{#each FIELD_TYPES as ft}
								<button
									onclick={() => addField(ft.type)}
									class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-[var(--font-ui)] text-[var(--color-muted)] hover:text-[var(--color-electric)] hover:bg-[var(--color-electric-dim)] transition-all"
								>
									<ft.icon size={13} />{ft.label}
								</button>
							{/each}
						</div>
					</div>

					<!-- field canvas -->
					<div class="flex-1 overflow-y-auto p-6">
						{#if selectedForm.fields.length === 0}
							<div class="flex flex-col items-center justify-center h-full text-center gap-3">
								<FormInput size={32} strokeWidth={1.25} class="text-[var(--color-muted)]" />
								<p class="text-sm text-[var(--color-muted)] font-[var(--font-ui)]">add fields from the left panel</p>
							</div>
						{:else}
							<div class="flex flex-wrap gap-4 max-w-2xl">
								{#each selectedForm.fields as field, i}
									<div class="{field.width === 'half' ? 'w-[calc(50%-8px)]' : 'w-full'} bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-electric)]/40 transition-colors">
										<!-- field meta controls -->
										<div class="flex items-center gap-1.5 mb-3 flex-wrap">
											<span class="text-[10px] uppercase tracking-widest text-[var(--color-electric)] font-[var(--font-body)]">{field.type}</span>
											<div class="flex-1"></div>
											<!-- width toggle -->
											<button
												onclick={() => updateField(field.id, 'width', field.width === 'full' ? 'half' : 'full')}
												class="text-[10px] font-[var(--font-body)] text-[var(--color-muted)] hover:text-[var(--color-text)] px-1.5 py-0.5 rounded border border-[var(--color-border)] transition-colors"
											>{field.width}</button>
											<!-- required toggle -->
											<button
												onclick={() => updateField(field.id, 'required', !field.required)}
												class="text-[10px] font-[var(--font-body)] px-1.5 py-0.5 rounded border transition-colors {field.required ? 'border-[var(--color-danger)]/40 text-[var(--color-danger)]' : 'border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]'}"
											>{field.required ? 'required' : 'optional'}</button>
											<!-- move up -->
											<button
												onclick={() => moveField(field.id, -1)}
												disabled={i === 0}
												class="p-1 text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-30 transition-colors"
												aria-label="move up"
											><GripVertical size={12} /></button>
											<!-- delete field -->
											<button
												onclick={() => removeField(field.id)}
												class="p-1 text-[var(--color-muted)] hover:text-[var(--color-danger)] transition-colors"
												aria-label="delete field"
											><Trash2 size={13} /></button>
										</div>

										<!-- label input -->
										<input
											type="text"
											bind:value={field.label}
											class="w-full bg-transparent text-sm font-[var(--font-display)] text-[var(--color-text)] outline-none border-b border-transparent focus:border-[var(--color-electric)] mb-2 transition-colors"
											placeholder="Field label"
										/>

										<!-- placeholder (not for checkbox/file) -->
										{#if field.type !== 'checkbox' && field.type !== 'file'}
											<input
												type="text"
												bind:value={field.placeholder}
												class="w-full bg-[var(--color-surface-2)] text-xs font-[var(--font-ui)] text-[var(--color-muted)] rounded-lg px-2 py-1.5 outline-none border border-[var(--color-border)] focus:border-[var(--color-electric)] transition-colors"
												placeholder="Placeholder text..."
											/>
										{/if}

										<!-- options for select -->
										{#if field.type === 'select'}
											<div class="mt-2 flex flex-col gap-1">
												{#each field.options ?? [] as opt, oi}
													<div class="flex items-center gap-1">
														<input
															type="text"
															value={opt}
															oninput={(e) => {
																// eslint-disable-next-line @typescript-eslint/no-explicit-any
																const opts = [...(field.options as any[])];
																opts[oi] = (e.target as HTMLInputElement).value;
																updateField(field.id, 'options', opts);
															}}
															class="flex-1 bg-[var(--color-surface-2)] text-xs font-[var(--font-body)] text-[var(--color-text)] rounded px-2 py-1 outline-none border border-[var(--color-border)] focus:border-[var(--color-electric)] transition-colors"
														/>
														<button
															onclick={() => {
																// eslint-disable-next-line @typescript-eslint/no-explicit-any
																const opts = (field.options as any[]).filter((_: unknown, idx: number) => idx !== oi);
																updateField(field.id, 'options', opts);
															}}
															class="p-0.5 text-[var(--color-muted)] hover:text-[var(--color-danger)]"
														><Trash2 size={10} /></button>
													</div>
												{/each}
												<button
													onclick={() => updateField(field.id, 'options', [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`])}
													class="text-[10px] text-[var(--color-electric)] hover:underline font-[var(--font-ui)] text-left mt-1"
												>+ add option</button>
											</div>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>
