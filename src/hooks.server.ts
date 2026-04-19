import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { createServerSupabase } from '$lib/supabase';

// routes that don't need authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/demo', '/api/ai', '/forms'];

export const handle: Handle = async ({ event, resolve }) => {
	// attach supabase client to every request
	event.locals.supabase = createServerSupabase(event);

	// refresh session — important: use getUser() not getSession() for security
	const {
		data: { user },
	} = await event.locals.supabase.auth.getUser();

	event.locals.session = user ? { user } : null;

	const path = event.url.pathname;
	const isPublic = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(r + '/'));

	// redirect unauthenticated users away from protected routes
	if (!isPublic && !event.locals.session) {
		throw redirect(303, '/login');
	}

	// resolve the request, injecting supabase's auth headers
	const response = await resolve(event, {
		filterSerializedResponseHeaders(name) {
			// allow supabase's auth headers to be forwarded
			return name === 'content-range' || name === 'x-supabase-api-version';
		},
	});

	return response;
};
