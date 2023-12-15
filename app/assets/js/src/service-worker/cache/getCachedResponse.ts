import { cacheName } from './cacheName';

/**
 * Retrieve a cached `Response` for a given `Request`, if one exists.
 */
export async function getCachedResponse(request: Request | URL): Promise<Response | undefined> {
	const cache = await caches.open(cacheName);
	const cachedResponse = await cache.match(request, { ignoreSearch: true });
	return cachedResponse;
}
