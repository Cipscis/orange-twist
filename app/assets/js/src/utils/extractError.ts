/**
 * Attempt to extract an `Error` object from an `unknown`, with fallbacks.
 */
export function extractError(
	error: unknown,
	fallback?: string,
): Error {
	if (error instanceof Error) {
		return error;
	} else if (typeof error === 'string') {
		return new Error(error);
	} else {
		return new Error(fallback ?? 'Encountered unknown error.', { cause: error });
	}
}
