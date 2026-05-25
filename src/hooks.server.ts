import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { createServerSupabase } from '$lib/supabase';

// routes that don't need authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/demo', '/api/ai', '/forms'];

export const handle: Handle = async ({ event, resolve }) => {
	// attach supabase client to every request
	event.locals.supabase = createServerSupabase(event);

	const path = event.url.pathname;
	const isPublic = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(r + '/'));

	// refresh session — use getUser() for security (validates JWT against the
	// auth server). wrap in try/catch so a transient supabase outage / rate
	// limit doesn't sign the user out — we'd rather a request 500 once than
	// silently kick people back to /login mid-session.
	let user = null;
	try {
		const result = await event.locals.supabase.auth.getUser();
		user = result.data.user;
		if (result.error && result.error.status !== 401 && result.error.status !== 403) {
			// non-auth errors (network, rate limit, 5xx from auth server) shouldn't
			// be treated as "logged out"
			console.warn('hooks.getUser non-auth error:', result.error.message);
		}
	} catch (err) {
		console.warn('hooks.getUser threw:', err);
	}

	event.locals.session = user ? { user } : null;

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
