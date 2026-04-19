import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: form, error: err } = await locals.supabase
		.from('forms')
		.select('*')
		.eq('id', params.id)
		.eq('is_public', true)
		.single();

	if (err || !form) throw error(404, 'form not found or not public');
	return { form, session: null };
};

export const actions: Actions = {
	submit: async ({ request, params, locals }) => {
		const fd = await request.formData();
		const data: Record<string, string> = {};
		for (const [key, val] of fd.entries()) {
			if (key !== 'form_id') data[key] = val as string;
		}
		const { error: err } = await locals.supabase
			.from('form_submissions')
			.insert({ form_id: params.id, data });
		if (err) return fail(500, { error: err.message });
		return { submitted: true };
	},
};
