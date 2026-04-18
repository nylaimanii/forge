import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

/** currently authenticated user — null when logged out */
export const user = writable<User | null>(null);

/** the project currently open in the editor — null on the dashboard */
export const activeProject = writable<{ id: string; name: string } | null>(null);

/** which view the user is currently in — drives sidebar active state */
export const activeView = writable<'schema' | 'sql' | 'ai' | 'visualize' | 'whiteboard'>('schema');

/** breadcrumbs fed by nested layouts into the shared TopBar */
export const breadcrumbs = writable<{ label: string; href?: string }[]>([]);

// re-export the toast store so consumers can import everything from '$lib/stores'
export { toasts, showToast, dismissToast } from './toasts';
