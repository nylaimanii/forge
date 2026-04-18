import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { explainQuery } from '$lib/ai';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	let body: { sql?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'invalid json body' }, { status: 400 });
	}

	const sql = (body.sql ?? '').trim();
	if (!sql) {
		return json({ error: 'sql is required' }, { status: 400 });
	}

	try {
		const explanation = await explainQuery(sql);
		return json({ explanation });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('explain:', message);
		return json({ error: message }, { status: 500 });
	}
};
