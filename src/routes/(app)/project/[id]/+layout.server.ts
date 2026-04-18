import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	// scope by user_id — users can only access their own projects
	const { data: project, error: dbError } = await locals.supabase
		.from('projects')
		.select('*')
		.eq('id', params.id)
		.eq('user_id', locals.session!.user.id)
		.single();

	if (dbError || !project) {
		throw error(404, 'project not found');
	}

	return { project };
};
