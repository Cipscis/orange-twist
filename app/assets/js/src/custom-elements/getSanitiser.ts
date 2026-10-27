let sanitiser: Sanitizer | null = null;

/**
 * Provide a `Sanitizer` that will allow custom HTML elements defined here to be used.
 */
export function getSanitiser(): Sanitizer {
	if (sanitiser) {
		return sanitiser;
	}

	sanitiser = new Sanitizer({});
	sanitiser.removeUnsafe();

	return sanitiser;
}
