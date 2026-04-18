import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateQuery } from '$lib/ai';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	let body: { question?: string; schema?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'invalid json body' }, { status: 400 });
	}

	const question = (body.question ?? '').trim();
	const schema   = (body.schema   ?? '').trim();

	if (!question) {
		return json({ error: 'question is required' }, { status: 400 });
	}

	try {
		const sql = await generateQuery(question, schema);
		return json({ sql });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('generate-query:', message);
		return json({ error: message }, { status: 500 });
	}
};
