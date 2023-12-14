import { cacheName } from './cacheName';

/**
 * Add a `Response` to a particular `Request` to the cache.
 */
export async function addToCache(request: Request, response: Response): Promise<void> {
	const cache = await caches.open(cacheName);

	await cache.put(request, response);
}
