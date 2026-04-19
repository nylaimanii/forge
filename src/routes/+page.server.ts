import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// authenticated users go straight to the dashboard
	if (locals.session) {
		throw redirect(303, '/dashboard');
	}

	return { projectCount: 47, session: null };
};
