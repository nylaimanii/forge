import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// DML endpoint: allows INSERT, UPDATE, DELETE (not SELECT — use /api/sql/run for that).
// Still requires an authenticated session and runs through the execute_sql RPC.
const ALLOWED = new Set(['INSERT', 'UPDATE', 'DELETE', 'WITH']);

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
		return json({ error: 'only INSERT, UPDATE, DELETE allowed via this endpoint' }, { status: 400 });
	}

	const { data, error } = await locals.supabase.rpc('execute_sql', { query: sql });
	if (error) return json({ error: error.message }, { status: 400 });

	const rows = Array.isArray(data) ? data : (data === null ? [] : [data]);
	return json({ rows });
};
