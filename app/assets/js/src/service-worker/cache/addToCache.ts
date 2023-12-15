import { cacheName } from './cacheName';

/**
 * Add a `Response` to a particular `Request` to the cache.
 */
export async function addToCache(request: Request, response: Response): Promise<void> {
	const cache = await caches.open(cacheName);

	try {
		await cache.put(request, response);
	} catch (e) {
		// Adding some pairs to the cache will fail, e.g. for
		// chrome-extension:// URLs. Just let them fail silently
	}
}
