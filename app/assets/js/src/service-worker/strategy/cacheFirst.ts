import {
	addToCache,
	getCachedResponse,
	refreshCache,
} from '../cache';
import { getSafeNetworkResponse } from '../utils';

/**
 * Return a cached `Response` if possible, while waiting for the network response.
 *
 * If an update is detected from a network response, refresh the entire cache by requesting
 * a fresh copy of each entry that already exists in the cache. Any entries that fail to be
 * refreshed in this way, for example due to a network error, will be cleared so fresh assets
 * will be requested and cached.
 *
 * The cache is refreshed asynchronously, without blocking the current request. It's assumed
 * that responses served during a document load are all requested up front, and will be
 * retrieved from the cache faster than the cache is able to be refreshed. So long as this
 * assumption holds, each document load should consist entirely of either stale or fresh assets.
 *
 * ---
 *
 * This strategy relies on the assumption that all network requests are for static assets, so
 * if the response of any request has changed then any number of others *may* have changed.
 *
 * This strategy also relies less heavily on the assumption that there is a relatively small
 * number and total size of these static assets, as this affects how heavy the act of refreshing
 * the cache is.
 */
export async function cacheFirst({ request }: FetchEvent): Promise<Response> {
	// Initialise the network request immediately, and queue its follow-up action to happen asynchronously
	const networkPromise = getSafeNetworkResponse(request);
	networkPromise.then(
		(response) => handleNetworkResponse(request, response.clone())
	);

	// Retrieve a cached response and try to return it
	const cachedResponse = await getCachedResponse(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	// If there was no cached response, try to return the network response eventually
	return await networkPromise;
}

/**
 * Adds a successful response to the cache. If it's changed since it was last cached, also refreshes the cache.
 *
 * Ignores unsuccessful responses.
 */
async function handleNetworkResponse(request: Request, response: Response) {
	if (!response.ok) {
		return;
	}

	// Create a copy so we can consume the original's body
	const responseToCache = response.clone();

	// Check if a response has changed since it was last cached, and refresh the cache if so
	const shouldRefreshCache = await (async () => {
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

	addToCache(request, responseToCache);
	if (shouldRefreshCache) {
		await refreshCache({
			exceptions: [request],
		});
	}
}
