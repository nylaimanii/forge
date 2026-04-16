/**
 * returns a human-readable relative time string from an ISO timestamp.
 * e.g. "just now", "5 min ago", "2 hours ago", "yesterday", "3 days ago", "2 weeks ago"
 * no external deps — vanilla js only.
 */
export function relativeTime(iso: string): string {
	const now  = Date.now();
	const then = new Date(iso).getTime();
	const diff = Math.floor((now - then) / 1000); // seconds elapsed

	if (diff < 60)                   return 'just now';
	if (diff < 3600)                 return `${Math.floor(diff / 60)} min ago`;
	if (diff < 7200)                 return '1 hour ago';
	if (diff < 86400)                return `${Math.floor(diff / 3600)} hours ago`;
	if (diff < 172800)               return 'yesterday';
	if (diff < 604800)               return `${Math.floor(diff / 86400)} days ago`;
	if (diff < 1209600)              return '1 week ago';
	if (diff < 2592000)              return `${Math.floor(diff / 604800)} weeks ago`;
	if (diff < 5184000)              return '1 month ago';
	return `${Math.floor(diff / 2592000)} months ago`;
}
