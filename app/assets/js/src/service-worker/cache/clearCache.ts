import { cacheName } from './cacheName';

/**
 * Remove all entries from the service worker cache.
 */
export async function clearCache(): Promise<void> {
	await caches.delete(cacheName);
}
