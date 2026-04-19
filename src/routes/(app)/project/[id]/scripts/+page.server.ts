import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [scriptsRes, formsRes, tablesRes] = await Promise.all([
		locals.supabase
			.from('scripts')
			.select('*')
			.eq('project_id', params.id)
			.order('created_at', { ascending: false }),
		// forms needed for "on form submit" trigger selector
		locals.supabase
			.from('forms')
			.select('id, title')
			.eq('project_id', params.id),
		// tables needed for "on row insert" trigger selector
		locals.supabase
			.from('schema_tables')
			.select('id, name')
			.eq('project_id', params.id),
	]);

	return {
		scripts: scriptsRes.data ?? [],
		forms: formsRes.data ?? [],
		tables: tablesRes.data ?? [],
	};
};

export const actions: Actions = {
	createScript: async ({ params, locals }) => {
		const { data: script, error } = await locals.supabase
			.from('scripts')
			.insert({
				project_id: params.id,
				user_id: locals.session!.user.id,
				name: 'untitled script',
				trigger_type: 'manual',
				trigger_config: {},
				actions: [],
			})
			.select()
			.single();
		if (error) return fail(500, { error: error.message });
		return { success: true, script };
	},

	saveScript: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const name = fd.get('name') as string;
		const trigger_type = fd.get('trigger_type') as string;
		const trigger_config = JSON.parse((fd.get('trigger_config') as string) || '{}');
		const actions = JSON.parse((fd.get('actions') as string) || '[]');

		const { error } = await locals.supabase
			.from('scripts')
			.update({ name, trigger_type, trigger_config, actions })
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	deleteScript: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const { error } = await locals.supabase
			.from('scripts')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	runScript: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;

		// fetch the script
		const { data: script, error: fetchErr } = await locals.supabase
			.from('scripts')
			.select('*')
			.eq('id', id)
			.eq('user_id', locals.session!.user.id)
			.single();

		if (fetchErr || !script) return fail(404, { error: 'script not found' });

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const scriptActions: any[] = Array.isArray(script.actions) ? script.actions : [];
		const results: { action: string; rows?: unknown[]; error?: string }[] = [];

		for (const action of scriptActions) {
			if (action.type === 'run_sql' && action.sql) {
				const { data, error } = await locals.supabase.rpc('execute_sql', { query: action.sql });
				if (error) {
					results.push({ action: action.type, error: error.message });
				} else {
					const rows = Array.isArray(data) ? data : (data === null ? [] : [data]);
					results.push({ action: action.type, rows });
				}
			} else if (action.type === 'call_webhook' && action.url) {
				try {
					const method = action.method ?? 'POST';
					const wRes = await fetch(action.url, { method });
					results.push({ action: action.type, rows: [{ status: wRes.status, ok: wRes.ok }] });
				} catch (e) {
					results.push({ action: action.type, error: String(e) });
				}
			} else if (action.type === 'insert_row' && action.table && action.template) {
				try {
					const rowData = JSON.parse(action.template);
					const { error } = await locals.supabase.from(action.table).insert(rowData);
					if (error) results.push({ action: action.type, error: error.message });
					else results.push({ action: action.type, rows: [{ inserted: true }] });
				} catch (e) {
					results.push({ action: action.type, error: String(e) });
				}
			} else {
				results.push({ action: action.type ?? 'unknown', rows: [] });
			}
		}

		// update last_run_at
		await locals.supabase
			.from('scripts')
			.update({ last_run_at: new Date().toISOString() })
			.eq('id', id);

		return { success: true, results };
	},
};
