import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * browser supabase client — use in .svelte components and client-side code.
 * safe to call multiple times; each call returns a fresh client instance.
 */
export function createBrowserSupabase() {
	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * server supabase client — use in +page.server.ts, +layout.server.ts, +server.ts.
 * reads/writes cookies from the incoming request event to maintain session state.
 */
export function createServerSupabase(event: RequestEvent) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: ()                  => event.cookies.getAll(),
			setAll: (cookiesToSet)      => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			},
		},
	});
}
