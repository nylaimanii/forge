import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	// project already loaded by the parent layout server, but we also need
	// schema tables + fields to generate the SQL export
	const { data: tables } = await locals.supabase
		.from('schema_tables')
		.select('id, name, fields:schema_fields(id, name, type, is_primary, is_nullable, position)')
		.eq('project_id', params.id)
		.order('created_at', { ascending: true });

	const { data: relationships } = await locals.supabase
		.from('schema_relationships')
		.select('*')
		.eq('project_id', params.id);

	return {
		schemaTables: tables ?? [],
		schemaRelationships: relationships ?? [],
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, locals, params }) => {
		const fd = await request.formData();
		const name = (fd.get('name') as string)?.trim();
		const color = (fd.get('color') as string)?.trim();

		if (!name) return fail(400, { error: 'name is required' });

		const { error } = await locals.supabase
			.from('projects')
			.update({ name, color, updated_at: new Date().toISOString() })
			.eq('id', params.id)
			.eq('user_id', locals.session!.user.id);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	deleteProject: async ({ request, locals, params }) => {
		const fd = await request.formData();
		const confirm = fd.get('confirm') as string;

		// the page sends the project name as confirmation
		if (!confirm) return fail(400, { error: 'confirm is required' });

		const { error } = await locals.supabase
			.from('projects')
			.delete()
			.eq('id', params.id)
			.eq('user_id', locals.session!.user.id);

		if (error) return fail(500, { error: error.message });
		throw redirect(303, '/dashboard');
	},
};
