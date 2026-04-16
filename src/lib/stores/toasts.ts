import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
	id:      string;
	type:    ToastType;
	message: string;
}

export const toasts = writable<Toast[]>([]);

/** show a toast. auto-dismisses after `duration` ms (default 4s) */
export function showToast(message: string, type: ToastType = 'info', duration = 4000) {
	const id = crypto.randomUUID();
	toasts.update((all) => [...all, { id, type, message }]);
	setTimeout(() => dismissToast(id), duration);
}

export function dismissToast(id: string) {
	toasts.update((all) => all.filter((t) => t.id !== id));
}
