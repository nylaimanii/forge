<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { showToast } from '$lib/stores/toasts';

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let ctx: CanvasRenderingContext2D | null = null;

	let drawing = $state(false);
	let color = $state('#00d9ff');
	let thickness = $state(4);
	let hasDrawn = $state(false);
	let toastTimer: ReturnType<typeof setTimeout> | null = null;

	const colors = ['#00d9ff', '#f0f0ff', '#a78bfa', '#fb7185'];

	function resize() {
		if (!canvasEl) return;
		const dpr = window.devicePixelRatio || 1;
		const rect = canvasEl.getBoundingClientRect();
		// save existing drawing
		const tmp = document.createElement('canvas');
		tmp.width = canvasEl.width;
		tmp.height = canvasEl.height;
		tmp.getContext('2d')?.drawImage(canvasEl, 0, 0);
		canvasEl.width = rect.width * dpr;
		canvasEl.height = rect.height * dpr;
		ctx = canvasEl.getContext('2d');
		if (ctx) {
			ctx.scale(dpr, dpr);
			ctx.drawImage(tmp, 0, 0, rect.width, rect.height);
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
		}
	}

	function getPos(e: PointerEvent): [number, number] {
		const rect = canvasEl!.getBoundingClientRect();
		return [e.clientX - rect.left, e.clientY - rect.top];
	}

	function onPointerDown(e: PointerEvent) {
		if (!ctx || !canvasEl) return;
		canvasEl.setPointerCapture(e.pointerId);
		drawing = true;
		const [x, y] = getPos(e);
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.strokeStyle = color;
		ctx.lineWidth = thickness;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
	}

	function onPointerMove(e: PointerEvent) {
		if (!drawing || !ctx) return;
		const [x, y] = getPos(e);
		ctx.lineTo(x, y);
		ctx.stroke();
		if (!hasDrawn) {
			hasDrawn = true;
			// debounced toast — fire once, reset after 5s
			if (!toastTimer) {
				toastTimer = setTimeout(() => {
					showToast('sign up free to save your whiteboard', 'info');
					toastTimer = null;
				}, 800);
			}
		}
	}

	function onPointerUp() {
		drawing = false;
		ctx?.beginPath();
	}

	function clearCanvas() {
		if (!ctx || !canvasEl) return;
		const dpr = window.devicePixelRatio || 1;
		ctx.clearRect(0, 0, canvasEl.width / dpr, canvasEl.height / dpr);
		hasDrawn = false;
	}

	onMount(() => {
		if (!canvasEl) return;
		ctx = canvasEl.getContext('2d');
		resize();
		window.addEventListener('resize', resize);
	});

	onDestroy(() => {
		window.removeEventListener('resize', resize);
		if (toastTimer) clearTimeout(toastTimer);
	});
</script>

<div class="relative" style="height: calc(100vh - 9rem); background: var(--color-bg); overflow: hidden;">

	<!-- toolbar -->
	<div class="absolute top-3 left-3 z-10 flex items-center gap-2 glass border border-[var(--color-border)] rounded-xl px-3 py-2">

		<!-- color swatches -->
		<div class="flex items-center gap-1.5">
			{#each colors as c}
				<button
					onclick={() => (color = c)}
					style="width:16px; height:16px; border-radius:50%; background:{c}; border:2px solid {color === c ? 'white' : 'transparent'}; cursor:pointer; transition:border-color 0.1s;"
					aria-label="color {c}"
				></button>
			{/each}
		</div>

		<div class="w-px h-4 bg-[var(--color-border)] mx-1"></div>

		<!-- thickness -->
		<div class="flex items-center gap-1">
			{#each [2, 4, 8] as t}
				<button
					onclick={() => (thickness = t)}
					class="flex items-center justify-center rounded cursor-pointer transition-colors"
					style="width:24px; height:24px; background:{thickness === t ? 'rgba(255,255,255,0.12)' : 'transparent'};"
					aria-label="thickness {t}"
				>
					<span
						style="width:{t * 1.5}px; height:{t * 1.5}px; border-radius:50%; background:var(--color-text); display:block;"
					></span>
				</button>
			{/each}
		</div>

		<div class="w-px h-4 bg-[var(--color-border)] mx-1"></div>

		<!-- clear -->
		<button
			onclick={clearCanvas}
			class="text-[var(--color-muted)] hover:text-[var(--color-text)] font-[var(--font-ui)] text-[11px] transition-colors cursor-pointer"
		>
			clear
		</button>
	</div>

	<!-- sign-up nudge -->
	<div class="absolute top-3 right-3 z-10">
		<a
			href="/signup"
			class="inline-flex items-center gap-1.5 glass border border-[var(--color-electric)]/30 rounded-lg px-3 py-1.5 text-[var(--color-electric)] font-[var(--font-ui)] text-[11px] hover:border-[var(--color-electric)]/60 transition-colors"
		>
			sign up to save →
		</a>
	</div>

	<!-- idle hint -->
	{#if !hasDrawn}
		<div
			class="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
			style="z-index:1;"
		>
			<p class="font-[var(--font-display)] text-[var(--color-muted)] opacity-30" style="font-size:clamp(1rem,3vw,1.5rem);">
				draw anything ✏️
			</p>
		</div>
	{/if}

	<!-- canvas -->
	<canvas
		bind:this={canvasEl}
		class="absolute inset-0 w-full h-full"
		style="cursor:crosshair; touch-action:none;"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	></canvas>

</div>
