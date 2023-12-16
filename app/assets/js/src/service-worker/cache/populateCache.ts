import { cacheName } from './cacheName';

/**
 * Adds resources to the service worker cache.
 */
export async function populateCache(): Promise<void> {
	const cache = await caches.open(cacheName);

	cache.addAll([
		'/',
		'/task/',
		'/408.html',
	]);
}
