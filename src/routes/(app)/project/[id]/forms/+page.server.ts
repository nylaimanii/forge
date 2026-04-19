import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: forms } = await locals.supabase
		.from('forms')
		.select('*')
		.eq('project_id', params.id)
		.order('created_at', { ascending: false });

	return { forms: forms ?? [] };
};

export const actions: Actions = {
	createForm: async ({ params, locals }) => {
		const { data: form, error } = await locals.supabase
			.from('forms')
			.insert({
				project_id: params.id,
				user_id: locals.session!.user.id,
				title: 'untitled form',
				fields: [],
			})
			.select()
			.single();
		if (error) return fail(500, { error: error.message });
		return { success: true, form };
	},

	saveForm: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const title = fd.get('title') as string;
		const fieldsRaw = fd.get('fields') as string;

		let fields: unknown[] = [];
		try { fields = JSON.parse(fieldsRaw); } catch { return fail(400, { error: 'invalid fields json' }); }

		const { error } = await locals.supabase
			.from('forms')
			.update({ title, fields, updated_at: new Date().toISOString() })
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	togglePublic: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const is_public = fd.get('is_public') === 'true';
		const { error } = await locals.supabase
			.from('forms')
			.update({ is_public })
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	deleteForm: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;
		const { error } = await locals.supabase
			.from('forms')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	loadSubmissions: async ({ request, locals }) => {
		const fd = await request.formData();
		const form_id = fd.get('form_id') as string;
		const { data, error } = await locals.supabase
			.from('form_submissions')
			.select('*')
			.eq('form_id', form_id)
			.order('submitted_at', { ascending: false });
		if (error) return fail(500, { error: error.message });
		return { submissions: data ?? [] };
	},
};
