import { addToCache, getCachedResponse } from '../cache';

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
			return await fetch(request);
		})();

		// If the response arrived, cache it and return it immediately
		//  without waiting for it to be added to the cache
		addToCache(request, networkResponse.clone());
		return networkResponse;
	} catch (error) {
		// `fetch` can throw an error if there was a network error

		// If the response should be in the cache, try to return a cached response
		const cachedResponse = await getCachedResponse(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		if (request.destination === 'document') {
			// If the request is for a page, and we don't have a cached
			// response, try to return a generic network error page
			const errorResponse = await getCachedResponse(new URL('/orange-twist/404.html', self.location.origin));
			if (errorResponse) {
				return errorResponse;
			}
		}

		// Otherwise, return a generic network error in plain text instead
		const message = error instanceof Error ? error.message : 'Network error';
		return new Response(message, {
			status: 408, // REQUEST_TIMEOUT
			headers: {
				'Content-Type': 'text/plain',
			},
		});
	}
}
