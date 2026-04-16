/**
 * forge AI stubs — implemented in phase 3 with groq llama-3.3-70b-versatile.
 * all functions here are server-side only — never import this in a .svelte
 * component or any file that runs in the browser.
 */

/**
 * generates raw postgresql CREATE TABLE statements from a natural language
 * description of the data model the user wants to build.
 *
 * todo (phase 3): call groq /v1/chat/completions with llama-3.3-70b-versatile
 * via a +server.ts route in src/routes/api/ai/
 */
export async function generateSchema(description: string): Promise<string> {
	void description;
	throw new Error('not implemented — coming in phase 3');
}

/**
 * converts a natural language question into a single postgresql SELECT query
 * scoped to the provided schema context.
 *
 * todo (phase 3): call groq /v1/chat/completions with llama-3.3-70b-versatile
 * via a +server.ts route in src/routes/api/ai/
 */
export async function generateQuery(question: string, schema: string): Promise<string> {
	void question;
	void schema;
	throw new Error('not implemented — coming in phase 3');
}
