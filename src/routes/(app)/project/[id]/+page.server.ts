import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

// /project/[id] → redirect to schema view
export const load: PageServerLoad = async ({ params }) => {
	throw redirect(303, `/project/${params.id}/schema`);
};
