import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	let body: { sql?: string; projectId?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'invalid json body' }, { status: 400 });
	}

	const sql = (body.sql ?? '').trim();

	if (!sql) {
		return json({ error: 'sql is required' }, { status: 400 });
	}

	// safety: only allow SELECT statements through this endpoint.
	// DDL should go through migrations.
	// SAFETY NOTE: execute_sql runs with SECURITY DEFINER — add rate limiting
	// and stricter validation before exposing this in a multi-tenant production app.
	const firstWord = sql.replace(/\/\*[\s\S]*?\*\/|--[^\n]*/g, '').trim().split(/\s+/)[0].toUpperCase();
	if (firstWord !== 'SELECT') {
		return json({ error: 'only SELECT statements are allowed via the SQL editor' }, { status: 400 });
	}

	const { data, error } = await locals.supabase.rpc('execute_sql', { query: sql });

	if (error) {
		return json({ error: error.message }, { status: 400 });
	}

	// execute_sql returns json_agg which comes back as an array or null
	const rows = Array.isArray(data) ? data : (data === null ? [] : [data]);

	return json({ rows });
};
