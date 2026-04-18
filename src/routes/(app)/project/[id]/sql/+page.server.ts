import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	// last 50 queries for this project
	const { data: history, error: historyErr } = await locals.supabase
		.from('query_history')
		.select('id, sql, source, ran_at')
		.eq('project_id', params.id)
		.eq('user_id', locals.session!.user.id)
		.order('ran_at', { ascending: false })
		.limit(50);

	if (historyErr) {
		console.error('sql load history:', historyErr.message);
	}

	// table names for the reference panel
	const { data: tables, error: tablesErr } = await locals.supabase
		.from('schema_tables')
		.select('id, name, fields:schema_fields(id, name, type)')
		.eq('project_id', params.id)
		.order('created_at', { ascending: true });

	if (tablesErr) {
		console.error('sql load tables:', tablesErr.message);
	}

	return {
		history: history ?? [],
		tables:  tables  ?? [],
	};
};

export const actions: Actions = {
	saveQuery: async ({ params, request, locals }) => {
		const form   = await request.formData();
		const sql    = (form.get('sql')    as string) ?? '';
		const source = (form.get('source') as string) ?? 'manual';

		if (!sql.trim()) return fail(400, { error: 'sql required' });

		const { error } = await locals.supabase
			.from('query_history')
			.insert({
				project_id: params.id,
				user_id:    locals.session!.user.id,
				sql,
				source:     source === 'ai' ? 'ai' : 'manual',
			});

		if (error) {
			console.error('saveQuery:', error.message);
			return fail(500, { error: error.message });
		}

		return { success: true };
	},
};
