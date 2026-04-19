import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.session!.user.id;

	// fetch all projects for the logged-in user, newest first
	const { data: projects, error } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('user_id', userId)
		.order('updated_at', { ascending: false });

	if (error) {
		console.error('failed to load projects:', error.message);
		return { projects: [], totalTables: 0, totalQueries: 0, recentActivity: [] };
	}

	const projectList = projects ?? [];
	const projectIds = projectList.map((p) => p.id);

	// parallel: table counts + total query count + recent activity
	const [tablesRes, queryCountRes, recentRes] = await Promise.all([
		// all schema_tables for user's projects — aggregate in JS
		projectIds.length > 0
			? locals.supabase.from('schema_tables').select('project_id').in('project_id', projectIds)
			: Promise.resolve({ data: [], error: null }),

		// total query count
		locals.supabase
			.from('query_history')
			.select('*', { count: 'exact', head: true })
			.eq('user_id', userId),

		// last 5 queries with project name
		locals.supabase
			.from('query_history')
			.select('id, sql, ran_at, project_id, project:projects(name)')
			.eq('user_id', userId)
			.order('ran_at', { ascending: false })
			.limit(5),
	]);

	// build per-project table count map
	const tableCountByProject: Record<string, number> = {};
	for (const row of tablesRes.data ?? []) {
		tableCountByProject[row.project_id] = (tableCountByProject[row.project_id] ?? 0) + 1;
	}

	const totalTables = (tablesRes.data ?? []).length;
	const totalQueries = queryCountRes.count ?? 0;

	// attach tableCount to each project
	const projectsWithCount = projectList.map((p) => ({
		...p,
		tableCount: tableCountByProject[p.id] ?? 0,
	}));

	return {
		projects: projectsWithCount,
		totalTables,
		totalQueries,
		recentActivity: recentRes.data ?? [],
	};
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
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);

		if (error) {
			console.error('deleteProject:', error.message);
			return fail(500, { error: 'failed to delete project — try again' });
		}

		return { success: true };
	},
};
