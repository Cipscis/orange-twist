import {
	addToCache,
	clearCache,
	getCachedResponse,
} from '../cache';
import { getFallbackResponse } from '../error';

/**
 * Return a cached `Response` if possible, while waiting for the network response.
 *
 * If an update is detected from a network response, clear the entire cache so fresh assets will be requested and cached.
 */
export async function cacheFirst({ preloadResponse, request }: FetchEvent): Promise<Response> {
	// Initialise the network request immediately, and queue its follow-up action to happen asynchronously
	const networkPromise = (async () => {
		// If there is a preloaded response, prefer that
		const preloadedNetworkResponse = await preloadResponse as unknown;
		if (preloadedNetworkResponse instanceof Response) {
			return preloadedNetworkResponse;
		}

		return await fetch(request);
	})();
	networkPromise.then(
		(response) => handleNetworkResponse(request, response)
	);

	// Retrieve a cached response and try to return it
	const cachedResponse = await getCachedResponse(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	// If there was no cached response, try to return the network response eventually
	try {
		return await networkPromise;
	} catch (error) {
		// If using the network response failed, provide a fallback
		return await getFallbackResponse(request, error);
	}
}

/**
 * Adds a successful response to the cache. If it's changed since it was last cached, also clears the cache.
 *
 * Ignores unsuccessful responses.
 */
async function handleNetworkResponse(request: Request, response: Response) {
	if (response.ok) {
		const responseToCache = response.clone();

		// Check if a response has changes since it was last cached, and clear the cache if so
		const shouldClearCache = await (async () => {
			const cachedResponse = await getCachedResponse(request);
			if (!cachedResponse?.body) {
				return false;
			}

			const [
				cachedResponseText,
				responseText,
			] = await Promise.all([
				cachedResponse.text(),
				response.text(),
			]);
			const hasChanged = cachedResponseText !== responseText;

			return hasChanged;
		})();

		if (shouldClearCache) {
			await clearCache();
		}
		addToCache(request, responseToCache);
	}
}
