import type { SupabaseClient } from '@supabase/supabase-js';

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			/** supabase client scoped to this request (server-side only) */
			supabase: SupabaseClient;
			/** current auth session, null if the user is not logged in */
			session: { user: import('@supabase/supabase-js').User } | null;
		}

		interface PageData {
			/** session forwarded from +layout.server.ts for client-side store hydration */
			session: { user: import('@supabase/supabase-js').User } | null;
		}

		// interface Error {}
		// interface Platform {}
	}
}

export {};
