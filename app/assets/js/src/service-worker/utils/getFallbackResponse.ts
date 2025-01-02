import { getCachedResponse } from '../cache';

/**
 * Provide a fallback `Response` for when we can't provide a response from the network or the cache.
 *
 * Provides a "Request Timeout" error message, either as HTML for document requests or as plain text.
 */
export async function getFallbackResponse(request: Request, error: unknown): Promise<Response> {
	if (request.destination === 'document') {
		// If the request is for a page, and we don't have a cached
		// response, try to return a generic network error page
		const errorResponse = await getCachedResponse(
			new URL('/408.html', self.location.origin)
		);

		if (errorResponse) {
			return new Response(errorResponse.clone().body, {
				...errorResponse,
				status: 408, // REQUEST_TIMEOUT
			});
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
