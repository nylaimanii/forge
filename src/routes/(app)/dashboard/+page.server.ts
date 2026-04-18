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
	// ── create ────────────────────────────────────────────────────────────────
	createProject: async ({ request, locals }) => {
		const form  = await request.formData();
		const name  = (form.get('name')  as string | null)?.trim() ?? '';
		const color = (form.get('color') as string | null)?.trim() ?? '#f59e0b';

		if (!name) return fail(400, { error: 'project name is required' });
		if (name.length > 100) return fail(400, { error: 'name must be 100 characters or less' });

		const { data: project, error } = await locals.supabase
			.from('projects')
			.insert({ user_id: locals.session!.user.id, name, color })
			.select()
			.single();

		if (error) {
			console.error('createProject:', error.message);
			return fail(500, { error: 'failed to create project — try again' });
		}

		return { success: true, project };
	},

	// ── rename ────────────────────────────────────────────────────────────────
	renameProject: async ({ request, locals }) => {
		const form = await request.formData();
		const id   = (form.get('id')   as string | null)?.trim() ?? '';
		const name = (form.get('name') as string | null)?.trim() ?? '';

		if (!id)   return fail(400, { error: 'project id is required' });
		if (!name) return fail(400, { error: 'project name is required' });
		if (name.length > 80) return fail(400, { error: 'name must be 80 characters or less' });

		const { error } = await locals.supabase
			.from('projects')
			.update({ name, updated_at: new Date().toISOString() })
			// scope by user_id so users can only rename their own projects
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);

		if (error) {
			console.error('renameProject:', error.message);
			return fail(500, { error: 'failed to rename project — try again' });
		}

		return { success: true };
	},

	// ── delete ────────────────────────────────────────────────────────────────
	deleteProject: async ({ request, locals }) => {
		const form = await request.formData();
		const id   = (form.get('id') as string | null)?.trim() ?? '';

		if (!id) return fail(400, { error: 'project id is required' });

		const { error } = await locals.supabase
			.from('projects')
			.delete()
			// scope by user_id — rls also enforces this, but we double-check here
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);

		if (error) {
			console.error('deleteProject:', error.message);
			return fail(500, { error: 'failed to delete project — try again' });
		}

		// on delete cascade in 001_initial.sql handles whiteboards, card_configs,
		// and query_history cleanup automatically.
		return { success: true };
	},
};
