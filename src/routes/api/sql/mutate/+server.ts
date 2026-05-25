import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Mutation endpoint: allows DML (INSERT, UPDATE, DELETE, WITH) plus the
// minimal DDL the visual schema builder needs to sync to real postgres
// (CREATE TABLE IF NOT EXISTS, ALTER TABLE ... RENAME TO).
// Still requires an authenticated session.
//
// DML is routed through execute_sql (wraps the query in json_agg so we get
// a result set back). DDL is routed through execute_ddl (no wrapping, just
// runs the statement) because DDL can't appear inside a subquery.
const ALLOWED = new Set(['INSERT', 'UPDATE', 'DELETE', 'WITH', 'CREATE', 'ALTER']);
const DDL     = new Set(['CREATE', 'ALTER', 'DROP']);

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
	if (!sql) return json({ error: 'sql is required' }, { status: 400 });

	const firstWord = sql.replace(/\/\*[\s\S]*?\*\/|--[^\n]*/g, '').trim().split(/\s+/)[0].toUpperCase();
	if (!ALLOWED.has(firstWord)) {
		return json({ error: 'only INSERT, UPDATE, DELETE, CREATE, ALTER allowed via this endpoint' }, { status: 400 });
	}

	// DDL: execute_ddl returns void — no result rows.
	// schema('public') is explicit so postgrest hits the right rpc namespace.
	if (DDL.has(firstWord)) {
		const { error } = await locals.supabase.schema('public').rpc('execute_ddl', { sql });
		if (error) {
			console.error('execute_ddl error:', JSON.stringify(error));
			return json({ error: error.message, details: error }, { status: 400 });
		}
		return json({ rows: [] });
	}

	// DML: execute_sql wraps in json_agg and returns the result set
	const { data, error } = await locals.supabase.rpc('execute_sql', { query: sql });
	if (error) return json({ error: error.message }, { status: 400 });

	const rows = Array.isArray(data) ? data : (data === null ? [] : [data]);
	return json({ rows });
};
