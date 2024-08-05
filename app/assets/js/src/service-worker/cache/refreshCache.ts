import { addToCache } from './addToCache';
import { cacheName } from './cacheName';

interface RefreshCacheOptions {
	exceptions?: readonly RequestInfo[];
}

/**
 * For each entry that currently exists in the cache, requests fresh data.
 *
 * If a good response arrives, cache it. Otherwise, clear that cache entry.
 */
export async function refreshCache(options?: RefreshCacheOptions): Promise<void> {
	const { exceptions } = {
		exceptions: [],
		...options,
	};

	const cache = await caches.open(cacheName);

	const requests = await cache.keys();
	const promisesToResolve: Promise<unknown>[] = [];
	requests.forEach((request) => {
		// Skip exceptions
		for (const exception of exceptions) {
			const exceptionUrl = typeof exception === 'string'
				? exception
				: String(exception.url);

			if (String(request.url) === exceptionUrl) {
				return;
			}
		}

		// Otherwise, request a fresh response then cache it
		const responsePromise = fetch(request);
		responsePromise
			.then((response) => {
				if (response.ok) {
					// If we got a good response, cache it
					promisesToResolve.push(addToCache(request, response));
				} else {
					// Otherwise, clear this entry
					promisesToResolve.push(cache.delete(request));
				}
			})
			.catch(() => {
				// If we couldn't get a new response, clear that entry
				promisesToResolve.push(cache.delete(request));
			});
		promisesToResolve.push(responsePromise);
	});

	// Don't resolve until the cache is refreshed
	await Promise.allSettled(promisesToResolve);
}
