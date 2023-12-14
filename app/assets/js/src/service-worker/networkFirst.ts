import { addToCache } from './addToCache';
import { getCachedResponse } from './getCachedResponse';

/**
 * Attempt to return a regular network `Response`, but if something goes
 * wrong return a cached `Response` instead, if possible.
 */
export async function networkFirst(request: Request): Promise<Response> {
	try {
		// TODO: Make sure all task detail pages use the same cache entry

		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			// If the response arrived, cache it and return it
			await addToCache(request, networkResponse.clone());

			return networkResponse;
		} else {
			// If the request should be in the cache, try to return a cached response
			const cachedResponse = await getCachedResponse(request);
			if (cachedResponse) {
				return cachedResponse;
			}

			// If we don't have a cached response, return back to the network response
			return networkResponse;
		}
	} catch (error) {
		// `fetch` can throw an error if there was a network error

		// If the response should be in the cache, try to return a cached response
		const cachedResponse = await getCachedResponse(request);
		if (cachedResponse) {
			return cachedResponse;
		}

		// TODO: If the request is for a page, and we don't have a cached response, try to return a generic network error page

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
