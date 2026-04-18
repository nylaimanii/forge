import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [wbRes, tablesRes] = await Promise.all([
		locals.supabase
			.from('whiteboards')
			.select('*')
			.eq('project_id', params.id)
			.limit(1)
			.maybeSingle(),

		locals.supabase
			.from('schema_tables')
			.select('id, name, fields:schema_fields(id, name, type)')
			.eq('project_id', params.id)
			.order('created_at', { ascending: true }),
	]);

	if (wbRes.error)     console.error('whiteboard load:', wbRes.error.message);
	if (tablesRes.error) console.error('whiteboard tables:', tablesRes.error.message);

	return {
		whiteboard: wbRes.data ?? null,
		tables:     tablesRes.data ?? [],
	};
};

export const actions: Actions = {
	saveWhiteboard: async ({ params, request, locals }) => {
		const form        = await request.formData();
		const canvas_json = (form.get('canvas_json') as string) ?? '';

		if (!canvas_json) return fail(400, { error: 'canvas_json required' });

		const { error } = await locals.supabase
			.from('whiteboards')
			.upsert(
				{ project_id: params.id, canvas_json, updated_at: new Date().toISOString() },
				{ onConflict: 'project_id' }
			);

		if (error) {
			console.error('saveWhiteboard:', error.message);
			return fail(500, { error: error.message });
		}

		return { success: true };
	},
};
