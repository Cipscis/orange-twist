/**
 * If the current browser supports the View Transitions API,
 * starts a view transition using the callback provided.
 *
 * Otherwise, calls the callback immediately without a view
 * transition.
 */
export function tryStartViewTransition(
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	callback: () => any
): void {
	if (document.startViewTransition) {
		document.startViewTransition(callback);
	} else {
		callback();
	}
}
