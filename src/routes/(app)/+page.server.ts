import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// fetch all projects for the logged-in user, newest first
	const { data: projects, error } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('user_id', locals.session!.user.id)
		.order('updated_at', { ascending: false });

	if (error) {
		console.error('failed to load projects:', error.message);
		return { projects: [] };
	}

	return { projects: projects ?? [] };
};

export const actions: Actions = {
	createProject: async ({ request, locals }) => {
		const form = await request.formData();
		const name  = (form.get('name')  as string | null)?.trim() ?? '';
		const color = (form.get('color') as string | null)?.trim() ?? '#6c63ff';

		// server-side validation
		if (!name) {
			return fail(400, { error: 'project name is required' });
		}
		if (name.length > 100) {
			return fail(400, { error: 'project name must be 100 characters or less' });
		}

		const { data: project, error } = await locals.supabase
			.from('projects')
			.insert({ user_id: locals.session!.user.id, name, color })
			.select()
			.single();

		if (error) {
			console.error('failed to create project:', error.message);
			return fail(500, { error: 'failed to create project — please try again' });
		}

		return { success: true, project };
	},
};
