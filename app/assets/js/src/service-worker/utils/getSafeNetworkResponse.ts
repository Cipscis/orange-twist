import { getFallbackResponse } from './getFallbackResponse';

/**
 * Simply using the Fetch API within a service worker can work in unintuitive ways
 * when handling a navigation request with a redirected response. This function
 * wraps a regular call to `fetch` with additional handling for:
 *
 * - Responses with type "opaqueredirect"
 * - Error handling with a fallback response
 * - Redirected responses to navigation request that need their "redirected" flag scrubbed
 */
export async function getSafeNetworkResponse(request: Request): Promise<Response> {
	try {
		const response = await fetch(request);

		// If the response is an opaque redirect, let the browser handle it
		if (response.type === 'opaqueredirect') {
			return response;
		}

		// Let error handling pick up fetch errors and bad responses
		if (!response.ok) {
			throw new Error(response.statusText);
		}

		// If we're trying to use a redirected response on a navigation request,
		// construct a new Response that won't be flagged as redirected
		if (request.redirect === 'manual' && response.redirected === true) {
			return new Response(await response.blob(), response);
		}

		return response;
	} catch (error) {
		// If using the network response failed, provide a fallback
		return await getFallbackResponse(request, error);
	}
}
