import { useEffect } from 'preact/hooks';

import { extractError } from 'utils/extractError';

import * as ui from 'ui';

/**
 * Apply enhancements intended for development mode only.
 */
export function useDevEnhancements(): void {
	// Display an alert when a runtime error is encountered
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		window.addEventListener('error', (event) => {
			const error = extractError(event.error);
			ui.alert(error.message, {
				dismissible: true,
				duration: null,
			});
		}, { signal });
		window.addEventListener('unhandledrejection', (event) => {
			const error = extractError(event.reason);
			ui.alert(error.message, {
				dismissible: true,
				duration: null,
			});
		}, { signal });

		return () => controller.abort();
	}, []);
}
