import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	// load all tables for this project, with their fields nested
	const { data: tables, error } = await locals.supabase
		.from('schema_tables')
		.select('id, name, x, y, fields:schema_fields(id, name, type, is_primary, is_nullable, position)')
		.eq('project_id', params.id)
		.order('created_at', { ascending: true });

	if (error) {
		console.error('schema load:', error.message);
		return { tables: [] };
	}

	return { tables: tables ?? [] };
};

export const actions: Actions = {
	// ── create a new table node ───────────────────────────────────────────────
	createTable: async ({ params, request, locals }) => {
		const form  = await request.formData();
		const count = parseInt((form.get('count') as string) ?? '0', 10);

		// stagger new tables so they don't stack on top of each other
		const offset = count * 40;

		const { data: table, error } = await locals.supabase
			.from('schema_tables')
			.insert({
				project_id: params.id,
				user_id:    locals.session!.user.id,
				name:       'new_table',
				x:          80 + offset,
				y:          80 + offset,
			})
			.select()
			.single();

		if (error) {
			console.error('createTable:', error.message);
			return fail(500, { error: 'failed to create table' });
		}

		return { success: true, table };
	},

	// ── persist table position after drag ────────────────────────────────────
	saveTablePosition: async ({ request, locals }) => {
		const form = await request.formData();
		const id   = (form.get('id')  as string) ?? '';
		const x    = parseFloat((form.get('x') as string) ?? '0');
		const y    = parseFloat((form.get('y') as string) ?? '0');

		if (!id) return fail(400, { error: 'id required' });

		const { error } = await locals.supabase
			.from('schema_tables')
			.update({ x, y })
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	// ── delete a table (cascade removes its fields) ───────────────────────────
	deleteTable: async ({ request, locals }) => {
		const form = await request.formData();
		const id   = (form.get('id') as string) ?? '';

		if (!id) return fail(400, { error: 'id required' });

		const { error } = await locals.supabase
			.from('schema_tables')
			.delete()
			.eq('id', id)
			.eq('user_id', locals.session!.user.id);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	// ── save all fields for a table ───────────────────────────────────────────
	// delete-and-reinsert is simpler than upsert and correct for this use case
	saveFields: async ({ params, request, locals }) => {
		const form       = await request.formData();
		const tableId    = (form.get('table_id') as string) ?? '';
		const fieldsJson = (form.get('fields')   as string) ?? '[]';

		if (!tableId) return fail(400, { error: 'table_id required' });

		let fields: { name: string; type: string; is_primary: boolean; is_nullable: boolean }[];
		try {
			fields = JSON.parse(fieldsJson);
		} catch {
			return fail(400, { error: 'invalid fields json' });
		}

		// verify the table belongs to this user before touching its fields
		const { data: tableRow } = await locals.supabase
			.from('schema_tables')
			.select('id')
			.eq('id', tableId)
			.eq('user_id', locals.session!.user.id)
			.single();

		if (!tableRow) return fail(403, { error: 'not authorised' });

		// delete all existing fields for this table then reinsert
		const { error: deleteError } = await locals.supabase
			.from('schema_fields')
			.delete()
			.eq('table_id', tableId);

		if (deleteError) return fail(500, { error: deleteError.message });

		if (fields.length > 0) {
			const { error: insertError } = await locals.supabase
				.from('schema_fields')
				.insert(
					fields.map((f, i) => ({
						table_id:   tableId,
						project_id: params.id,
						name:       f.name || `field_${i + 1}`,
						type:       f.type || 'text',
						is_primary: f.is_primary  ?? false,
						is_nullable: f.is_nullable ?? true,
						position:   i,
					}))
				);

			if (insertError) return fail(500, { error: insertError.message });
		}

		// return the freshly inserted fields so the client can update its state
		const { data: newFields } = await locals.supabase
			.from('schema_fields')
			.select('id, name, type, is_primary, is_nullable, position')
			.eq('table_id', tableId)
			.order('position', { ascending: true });

		return { success: true, fields: newFields ?? [] };
	},
};
