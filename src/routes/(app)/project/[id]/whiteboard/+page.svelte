<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';
	import { Database, Save } from 'lucide-svelte';
	import Button from '$components/ui/Button.svelte';
	import DataCardPicker from '$components/whiteboard/DataCardPicker.svelte';
	import type { DataCardConfig } from '$components/whiteboard/DataCardPicker.svelte';
	import { showToast } from '$lib/stores/toasts';

	let { data }: { data: PageData } = $props();

	// ── canvas container ref ──────────────────────────────────────────────────
	let canvasContainer: HTMLDivElement | undefined = $state();

	// ── editor (tldraw, typed as any to avoid tldraw TS surface) ─────────────
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let editor: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let reactRoot: any = null;

	// ── save state ────────────────────────────────────────────────────────────
	let unsaved   = $state(false);
	let saveTimer: ReturnType<typeof setTimeout> | null = null;

	function markUnsaved() {
		unsaved = true;
		// auto-save debounce: 2s after last change
		if (saveTimer) clearTimeout(saveTimer);
		saveTimer = setTimeout(() => doSave(), 2000);
	}

	async function doSave() {
		if (!editor) return;
		try {
			const snapshot   = editor.store.getSnapshot();
			const canvasJson = JSON.stringify(snapshot);
			await fetch('?/saveWhiteboard', {
				method:  'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body:    new URLSearchParams({ canvas_json: canvasJson }),
			});
			unsaved = false;
		} catch (e) {
			console.error('whiteboard save failed:', e);
		}
	}

	// ── picker modal ──────────────────────────────────────────────────────────
	let pickerOpen = $state(false);

	function handleInsertCard(card: DataCardConfig) {
		pickerOpen = false;
		if (!editor) return;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { createShapeId } = (window as any).__tldrawModule;
		const center = editor.getViewportPageCenter();

		editor.createShape({
			id:   createShapeId(),
			type: 'data-card',
			x:    center.x - 100,
			y:    center.y - 80,
			props: {
				w:           200,
				h:           160,
				tableName:   card.tableName,
				tableId:     card.tableId,
				rowDataJson: JSON.stringify(card.rowData),
				fieldsJson:  JSON.stringify(card.fields),
			},
		});
	}

	// ── mount tldraw via React root ───────────────────────────────────────────
	onMount(async () => {
		if (!canvasContainer) return;

		// import CSS (side-effect)
		await import('tldraw/tldraw.css');

		// dynamic imports — keep tldraw out of SSR
		const React          = (await import('react')).default;
		const { createRoot } = await import('react-dom/client');
		const tldraw         = await import('tldraw');

		const {
			Tldraw,
			BaseBoxShapeUtil,
			T,
			createShapeId: _createShapeId,
		} = tldraw;

		// stash createShapeId so insertCard can access it
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).__tldrawModule = { createShapeId: _createShapeId };

		// ── DataCard shape util (defined inline, all any to avoid tldraw TS) ──
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		class DataCardShapeUtil extends (BaseBoxShapeUtil as any) {
			static type = 'data-card';
			static props = {
				w:           T.number,
				h:           T.number,
				tableName:   T.string,
				tableId:     T.string,
				rowDataJson: T.string,
				fieldsJson:  T.string,
			};

			getDefaultProps() {
				return { w: 200, h: 160, tableName: '', tableId: '', rowDataJson: '{}', fieldsJson: '[]' };
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			component(shape: any) {
				const { props } = shape;
				let rowData: Record<string, unknown> = {};
				let fields: string[] = [];
				try { rowData = JSON.parse(props.rowDataJson); } catch {}
				try { fields  = JSON.parse(props.fieldsJson);  } catch {}

				const PALETTE = ['#6c63ff','#00f5d4','#ff4d6d','#ffb84d','#7dd87d','#b784ff'];
				let h = 0;
				for (let i = 0; i < props.tableName.length; i++) h = (h * 31 + props.tableName.charCodeAt(i)) & 0xffff;
				const dotColor = PALETTE[h % PALETTE.length];

				const entries = fields.slice(0, 4).map((f: string) =>
					React.createElement('div', {
						key:   f,
						style: { display: 'flex', gap: '6px', alignItems: 'baseline' },
					},
						React.createElement('span', {
							style: { color: '#6b6b8a', fontSize: '9px', minWidth: '56px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'DM Mono, monospace', flexShrink: 0 },
						}, f.slice(0, 8)),
						React.createElement('span', {
							style: { color: '#e0e0ff', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' },
						}, String(rowData[f] ?? '—'))
					)
				);

				return React.createElement('div', {
					style: {
						width:         '100%',
						height:        '100%',
						background:    '#0f0f1a',
						border:        '1px solid rgba(255,255,255,0.12)',
						borderRadius:  '12px',
						overflow:      'hidden',
						display:       'flex',
						flexDirection: 'column',
						userSelect:    'none',
					},
				},
					// header
					React.createElement('div', {
						style: {
							padding:         '8px 10px',
							borderBottom:    '1px solid rgba(255,255,255,0.08)',
							display:         'flex',
							alignItems:      'center',
							gap:             '6px',
							background:      'rgba(255,255,255,0.03)',
						},
					},
						React.createElement('span', {
							style: { width: '8px', height: '8px', borderRadius: '50%', background: dotColor, display: 'inline-block', boxShadow: `0 0 6px ${dotColor}80`, flexShrink: 0 },
						}),
						React.createElement('span', {
							style: { fontSize: '11px', fontWeight: 'bold', color: '#f0f0ff', fontFamily: 'DM Serif Display, serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
						}, props.tableName)
					),
					// body
					React.createElement('div', {
						style: { padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflow: 'hidden' },
					},
						...entries
					),
					// footer
					React.createElement('div', {
						style: { padding: '4px 10px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '9px', color: '#6b6b8a', fontFamily: 'DM Mono, monospace', letterSpacing: '0.05em' },
					}, 'forge data card')
				);
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			indicator(shape: any) {
				return React.createElement('rect', {
					width:  shape.props.w,
					height: shape.props.h,
					rx:     12,
					ry:     12,
				});
			}
		}

		// ── create React root and render Tldraw ───────────────────────────────
		reactRoot = createRoot(canvasContainer);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const handleTldrawMount = (ed: any) => {
			editor = ed;

			// restore saved snapshot
			if (data.whiteboard?.canvas_json) {
				try {
					ed.store.loadSnapshot(JSON.parse(data.whiteboard.canvas_json));
				} catch (e) {
					console.warn('whiteboard: failed to restore snapshot', e);
				}
			}

			// listen for changes from user actions only
			ed.store.listen(
				() => { markUnsaved(); },
				{ source: 'user', scope: 'document' }
			);
		};

		reactRoot.render(
			React.createElement(Tldraw as any, {	// eslint-disable-line @typescript-eslint/no-explicit-any
				shapeUtils: [DataCardShapeUtil],
				onMount:    handleTldrawMount,
			})
		);
	});

	onDestroy(() => {
		if (saveTimer) clearTimeout(saveTimer);
		// attempt sync save before unmount
		if (unsaved && editor) doSave();
		// unmount React tree
		setTimeout(() => reactRoot?.unmount(), 0);
	});
</script>

<!-- beforeunload: save if there are pending changes -->
<svelte:window
	onbeforeunload={() => { if (unsaved && editor) doSave(); }}
/>

<!--
	Full remaining viewport. -mt-12 escapes the pt-12 from the project layout.
-->
<div class="relative -mt-12" style="height: calc(100vh - 6.5rem); overflow: hidden;">

	<!-- floating toolbar -->
	<div class="absolute top-3 left-3 z-10 flex items-center gap-2 glass border border-[var(--color-border)] rounded-xl px-3 py-2">
		<Button variant="primary" size="sm" onclick={() => (pickerOpen = true)}>
			{#snippet icon()}<Database size={12} />{/snippet}
			{#snippet children()}insert data card{/snippet}
		</Button>

		<Button variant="ghost" size="sm" onclick={doSave}>
			{#snippet icon()}<Save size={12} />{/snippet}
			{#snippet children()}save{/snippet}
		</Button>

		<!-- save indicator -->
		<div class="flex items-center gap-1.5 ml-1">
			<span
				class="w-1.5 h-1.5 rounded-full {unsaved ? 'bg-[var(--color-accent)]' : 'bg-emerald-400'}"
			></span>
			<span class="text-[10px] font-[var(--font-ui)] {unsaved ? 'text-[var(--color-muted)]' : 'text-emerald-400'}">
				{unsaved ? 'unsaved changes' : 'saved'}
			</span>
		</div>
	</div>

	<!-- tldraw canvas container — React mounts here -->
	<div bind:this={canvasContainer} class="w-full h-full"></div>
</div>

<!-- data card picker modal -->
<DataCardPicker
	open={pickerOpen}
	tables={data.tables as any}
	oninsert={handleInsertCard}
	onclose={() => (pickerOpen = false)}
/>
