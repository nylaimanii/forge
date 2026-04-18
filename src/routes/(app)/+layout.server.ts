import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// allow unauthenticated access to the public homepage at /
	if (!locals.session && url.pathname !== '/') {
		throw redirect(303, '/login');
	}

	// forward session to the layout and pages so stores can be hydrated
	return {
		session: locals.session,
	};
};
