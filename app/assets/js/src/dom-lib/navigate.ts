declare global {
	interface Navigation {
		/**
		 * Navigate to a specific URL using the Navigation API.
		 *
		 * Baseline Newly Available since January 2026. Not yet available in TypeScript as of v5.9.3.
		 *
		 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Navigation/navigate `navigate` || MDN docs}
		 */
		navigate(url: string, options?: NavigateOptions): void;
	}

	interface NavigateOptions {
		state?: unknown;
		info?: unknown;
		history?: 'auto' | 'push' | 'replace';
	}

	interface Window {
		navigation: Navigation;
	}
}
