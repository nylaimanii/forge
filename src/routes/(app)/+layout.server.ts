import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ locals }) => {
	// hooks.server.ts already redirects globally, but we double-guard here
	// in case the (app) group is accessed in a way that bypasses the hook
	if (!locals.session) {
		throw redirect(303, '/login');
	}

	// forward session to the layout and pages so stores can be hydrated
	return {
		session: locals.session,
	};
};
