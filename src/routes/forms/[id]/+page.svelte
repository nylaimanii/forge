<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>{data.form.title} — Forge</title></svelte:head>

<div style="min-height:100vh; background:var(--color-bg); display:flex; align-items:center; justify-content:center; padding:40px 24px;">
	<div style="width:100%; max-width:560px;">
		<p style="font-family:var(--font-body); font-size:11px; color:var(--color-electric); letter-spacing:0.2em; text-transform:uppercase; margin-bottom:8px;">forge form</p>
		<h1 style="font-family:var(--font-display); font-weight:700; font-size:28px; color:var(--color-text); margin-bottom:32px;">{data.form.title}</h1>

		{#if actionData?.submitted}
			<div style="padding:32px; border-radius:16px; border:1px solid rgba(34,211,165,0.3); background:rgba(34,211,165,0.05); text-align:center;">
				<p style="font-family:var(--font-display); font-size:18px; color:var(--color-success); margin-bottom:8px;">✓ thank you!</p>
				<p style="font-family:var(--font-ui); font-size:14px; color:var(--color-muted);">your response was recorded.</p>
			</div>
		{:else}
			<form method="POST" action="?/submit" use:enhance style="display:flex; flex-direction:column; gap:20px;">
				<input type="hidden" name="form_id" value={data.form.id} />
				{#each data.form.fields as field}
					<div>
						<label style="display:block; font-family:var(--font-ui); font-size:13px; color:var(--color-muted); margin-bottom:6px;">
							{field.label}{#if field.required}<span style="color:var(--color-danger);"> *</span>{/if}
						</label>
						{#if field.type === 'textarea'}
							<textarea name={field.id} placeholder={field.placeholder} required={field.required} style="width:100%; background:var(--color-surface-1); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:10px 12px; color:var(--color-text); font-family:var(--font-ui); font-size:14px; outline:none; resize:vertical; min-height:96px; box-sizing:border-box;"></textarea>
						{:else if field.type === 'select'}
							<select name={field.id} required={field.required} style="width:100%; background:var(--color-surface-1); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:10px 12px; color:var(--color-text); font-family:var(--font-ui); font-size:14px; outline:none;">
								{#each field.options ?? [] as opt}<option value={opt}>{opt}</option>{/each}
							</select>
						{:else if field.type === 'checkbox'}
							<div style="display:flex; align-items:center; gap:8px;">
								<input type="checkbox" name={field.id} id={field.id} />
								<label for={field.id} style="font-family:var(--font-ui); font-size:14px; color:var(--color-text);">{field.placeholder || field.label}</label>
							</div>
						{:else}
							<input
								type={field.type === 'file' ? 'text' : field.type}
								name={field.id}
								placeholder={field.placeholder}
								required={field.required}
								style="width:100%; background:var(--color-surface-1); border:1px solid rgba(255,255,255,0.06); border-radius:10px; padding:10px 12px; color:var(--color-text); font-family:var(--font-ui); font-size:14px; outline:none; box-sizing:border-box;"
							/>
						{/if}
					</div>
				{/each}
				{#if actionData?.error}
					<p style="color:var(--color-danger); font-size:13px; font-family:var(--font-ui);">{actionData.error}</p>
				{/if}
				<button type="submit" style="height:48px; border-radius:12px; background:var(--color-accent); color:#05050a; font-family:var(--font-display); font-weight:600; font-size:15px; border:none; cursor:pointer; transition:all 0.15s;">submit →</button>
			</form>
		{/if}

		<p style="margin-top:24px; text-align:center; font-family:var(--font-body); font-size:11px; color:var(--color-muted);">
			powered by <a href="/" style="color:var(--color-electric); text-decoration:none;">forge</a>
		</p>
	</div>
</div>
