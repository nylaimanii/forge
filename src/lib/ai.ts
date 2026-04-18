/**
 * forge AI — server-side only. never import this in a .svelte component
 * or any file that runs in the browser.
 */

import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '$env/static/private';

const groq  = new Groq({ apiKey: GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

/**
 * generates raw postgresql CREATE TABLE statements from a natural language
 * description of the data model.
 */
export async function generateSchema(description: string): Promise<string> {
	const completion = await groq.chat.completions.create({
		model: MODEL,
		max_tokens: 1000,
		temperature: 0.2,
		messages: [
			{
				role:    'system',
				content: 'You are a PostgreSQL expert. Generate clean CREATE TABLE statements only. Return raw SQL with no markdown, no backticks, no explanation. Use snake_case for all names. Always include an id UUID PRIMARY KEY DEFAULT gen_random_uuid() and created_at TIMESTAMPTZ DEFAULT now() on every table.',
			},
			{
				role:    'user',
				content: description,
			},
		],
	});

	return completion.choices[0].message.content ?? '';
}

/**
 * converts a natural language question into a single postgresql SELECT query
 * scoped to the provided schema context.
 */
export async function generateQuery(question: string, schema: string): Promise<string> {
	const completion = await groq.chat.completions.create({
		model: MODEL,
		max_tokens: 500,
		temperature: 0.1,
		messages: [
			{
				role:    'system',
				content: 'You are a PostgreSQL expert. Convert the user\'s natural language question into a single valid PostgreSQL SELECT query. Return only the raw SQL query with no markdown, no backticks, no explanation. Use the schema provided.',
			},
			{
				role:    'user',
				content: `Schema:\n${schema}\n\nQuestion: ${question}`,
			},
		],
	});

	return (completion.choices[0].message.content ?? '').trim();
}

/**
 * explains what a SQL query does in plain english.
 */
export async function explainQuery(sql: string): Promise<string> {
	const completion = await groq.chat.completions.create({
		model: MODEL,
		max_tokens: 300,
		temperature: 0.3,
		messages: [
			{
				role:    'system',
				content: 'You are a PostgreSQL expert. Explain what the following SQL query does in 2-3 plain English sentences. Be concise and clear.',
			},
			{
				role:    'user',
				content: sql,
			},
		],
	});

	return (completion.choices[0].message.content ?? '').trim();
}
