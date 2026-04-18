import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const [tablesRes, configsRes] = await Promise.all([
		locals.supabase
			.from('schema_tables')
			.select('id, name, fields:schema_fields(id, name, type)')
			.eq('project_id', params.id)
			.order('created_at', { ascending: true }),

		locals.supabase
			.from('card_configs')
			.select('id, table_name, config')
			.eq('project_id', params.id),
	]);

	if (tablesRes.error)   console.error('visualize load tables:', tablesRes.error.message);
	if (configsRes.error)  console.error('visualize load configs:', configsRes.error.message);

	return {
		tables:      tablesRes.data  ?? [],
		cardConfigs: configsRes.data ?? [],
	};
};

export const actions: Actions = {
	saveCardConfig: async ({ params, request, locals }) => {
		const form       = await request.formData();
		const table_name = (form.get('table_name') as string) ?? '';
		const configJson = (form.get('config')     as string) ?? '{}';

		if (!table_name) return fail(400, { error: 'table_name required' });

		let config: object;
		try {
			config = JSON.parse(configJson);
		} catch {
			return fail(400, { error: 'invalid config json' });
		}

		const { error } = await locals.supabase
			.from('card_configs')
			.upsert(
				{ project_id: params.id, table_name, config, updated_at: new Date().toISOString() },
				{ onConflict: 'project_id,table_name' }
			);

		if (error) {
			console.error('saveCardConfig:', error.message);
			return fail(500, { error: error.message });
		}

		return { success: true };
	},
};
