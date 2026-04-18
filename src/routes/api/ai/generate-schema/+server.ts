import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateSchema } from '$lib/ai';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		return json({ error: 'unauthorized' }, { status: 401 });
	}

	let body: { description?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'invalid json body' }, { status: 400 });
	}

	const description = (body.description ?? '').trim();
	if (!description) {
		return json({ error: 'description is required' }, { status: 400 });
	}

	try {
		const sql = await generateSchema(description);
		return json({ sql });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'unknown error';
		console.error('generate-schema:', message);
		return json({ error: message }, { status: 500 });
	}
};
