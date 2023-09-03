declare global {
	interface Element {
		// Not adding support for sanitiser options
		/**
		 * Sets inner HTML with built-in sanitisation.
		 *
		 * @see {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML setHTML}
		 */
		setHTML?: (input: string) => void;
	}
}

export {};
