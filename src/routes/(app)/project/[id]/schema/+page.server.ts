import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	// tables + their fields
	const { data: tables, error: tablesErr } = await locals.supabase
		.from('schema_tables')
		.select('id, name, x, y, fields:schema_fields(id, name, type, is_primary, is_nullable, position)')
		.eq('project_id', params.id)
		.order('created_at', { ascending: true });

	if (tablesErr) {
		console.error('schema load tables:', tablesErr.message);
		return { tables: [], relationships: [] };
	}

	// relationships for this project
	const { data: relationships, error: relErr } = await locals.supabase
		.from('schema_relationships')
		.select('id, from_table_id, from_field_id, to_table_id, to_field_id, relation_type')
		.eq('project_id', params.id);

	if (relErr) {
		console.error('schema load relationships:', relErr.message);
	}

	return {
		tables:        tables        ?? [],
		relationships: relationships ?? [],
	};
};

export const actions: Actions = {
	// ── create a new table node ───────────────────────────────────────────────
	createTable: async ({ params, request, locals }) => {
		const form  = await request.formData();
		const count = parseInt((form.get('count') as string) ?? '0', 10);
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

	// ── delete a table (cascade removes its fields + relationships) ───────────
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

		const { data: tableRow } = await locals.supabase
			.from('schema_tables')
			.select('id')
			.eq('id', tableId)
			.eq('user_id', locals.session!.user.id)
			.single();

		if (!tableRow) return fail(403, { error: 'not authorised' });

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
						table_id:    tableId,
						project_id:  params.id,
						name:        f.name       || `field_${i + 1}`,
						type:        f.type       || 'text',
						is_primary:  f.is_primary  ?? false,
						is_nullable: f.is_nullable ?? true,
						position:    i,
					}))
				);

			if (insertError) return fail(500, { error: insertError.message });
		}

		const { data: newFields } = await locals.supabase
			.from('schema_fields')
			.select('id, name, type, is_primary, is_nullable, position')
			.eq('table_id', tableId)
			.order('position', { ascending: true });

		return { success: true, fields: newFields ?? [] };
	},

	// ── create a foreign-key relationship between two fields ──────────────────
	createRelationship: async ({ params, request, locals }) => {
		const form          = await request.formData();
		const from_table_id = (form.get('from_table_id') as string) ?? '';
		const from_field_id = (form.get('from_field_id') as string) ?? '';
		const to_table_id   = (form.get('to_table_id')   as string) ?? '';
		const to_field_id   = (form.get('to_field_id')   as string) ?? '';
		const relation_type = (form.get('relation_type') as string) ?? 'one-to-many';

		if (!from_table_id || !from_field_id || !to_table_id || !to_field_id) {
			return fail(400, { error: 'all four field ids are required' });
		}

		const { data: relationship, error } = await locals.supabase
			.from('schema_relationships')
			.insert({ project_id: params.id, from_table_id, from_field_id, to_table_id, to_field_id, relation_type })
			.select()
			.single();

		if (error) {
			console.error('createRelationship:', error.message);
			return fail(500, { error: 'failed to create relationship' });
		}

		return { success: true, relationship };
	},

	// ── delete a relationship line ────────────────────────────────────────────
	deleteRelationship: async ({ params, request, locals }) => {
		const form = await request.formData();
		const id   = (form.get('id') as string) ?? '';

		if (!id) return fail(400, { error: 'id required' });

		const { error } = await locals.supabase
			.from('schema_relationships')
			.delete()
			.eq('id', id)
			// scope by project_id (rls also enforces this)
			.eq('project_id', params.id);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},
};
