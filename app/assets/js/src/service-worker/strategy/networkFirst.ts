import { addToCache, getCachedResponse } from '../cache';
import { getFallbackResponse, getSafeNetworkResponse } from '../utils';

/**
 * Attempt to return a regular network `Response`, but if something goes
 * wrong return a cached `Response` instead, if possible.
 */
export async function networkFirst({ preloadResponse, request }: FetchEvent): Promise<Response> {
	try {
		const networkResponse = await (async () => {
			// If a response was preloaded, return it
			const preloadedNetworkResponse = await preloadResponse as unknown;
			if (preloadedNetworkResponse instanceof Response) {
				return preloadedNetworkResponse;
			}

			// Otherwise, make the request and return its response
			return await getSafeNetworkResponse(request);
		})();

		// If the response arrived, cache it if it was okay, and return
		// it immediately without waiting for it to be added to the cache
		if (networkResponse.ok) {
			addToCache(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		// `fetch` can throw an error if there was a network error

		// If the response should be in the cache, try to return a cached response
		const cachedResponse = await getCachedResponse(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		// If the request failed and we can't return a cached response, use a fallback
		return await getFallbackResponse(request, error);
	}
}
