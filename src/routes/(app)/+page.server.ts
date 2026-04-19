import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// authenticated users go straight to the dashboard
	if (locals.session) {
		throw redirect(303, '/dashboard');
	}

	// get a public project count (anon key; RLS filters to visible rows — will be 0 until a public policy is added)
	const { count } = await locals.supabase
		.from('projects')
		.select('*', { count: 'exact', head: true });

	return { projectCount: count ?? 0 };
};
