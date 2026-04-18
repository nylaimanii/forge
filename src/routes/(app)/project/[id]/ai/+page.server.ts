import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: tables, error } = await locals.supabase
		.from('schema_tables')
		.select('id, name, fields:schema_fields(id, name, type)')
		.eq('project_id', params.id)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('ai load tables:', error.message);
	}

	return { tables: tables ?? [] };
};
