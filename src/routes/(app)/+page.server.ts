import type { PageServerLoad } from './$types';

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
