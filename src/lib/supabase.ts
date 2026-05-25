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
 *
 * cookieOptions pins maxAge to 7 days so refresh-token cookies survive
 * across long idle windows and aren't capped by a shorter default.
 */
export function createServerSupabase(event: RequestEvent) {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookieOptions: {
			path:    '/',
			sameSite: 'lax',
			httpOnly: false,
			secure:   true,
			maxAge:   60 * 60 * 24 * 7, // 7 days
		},
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
