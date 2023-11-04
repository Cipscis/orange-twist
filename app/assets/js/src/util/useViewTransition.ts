import { useCallback, useEffect, useState } from 'preact/hooks';

interface ViewTransitionState {
	/**
	 * @param callback The view transition callback that updates the DOM so there's something to transition to.
	 *
	 * @example
	 * ```typescript
	 * startViewTransition(() => setMyStateVariable(newValue));
	 * ```
	 */
	startViewTransition: (callback: () => void) => void;
	/**
	 * Whether or not the component is currently preparing for or executing a view transition.
	 *
	 * This should be used as a condition to apply `view-transition-name` properties relevant
	 * to the view transition.
	 *
	 * @example
	 * ```typescript
	 * html`
	 *     <div
	 *         style="view-transition-name: ${
	 *             isInViewTransition
	 *                 ? 'unique-name'
	 *                 : 'none'
	 *         }"
	 *     >
	 *         <!-- ... -->
	 *     </div>
	 * `
	 * ```
	 */
	isInViewTransition: boolean;
}

/**
 * The [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
 * requires passing a callback that will update the DOM, either synchronously or returning a `Promise`
 * that resolves once the DOM has been updated.
 *
 * This assumes that the developer is in control of DOM rendering, but when using a framework like
 * Preact that is not the case. This custom hook wraps around `document.startViewTransition` in a way
 * that handles waiting for the component to re-render before telling the browser we're ready to
 * start a view transition.
 *
 * This hook also provides an `isInViewTransition` flag that can be used for adding `view-transition-name`
 * CSS properties only when they are needed, which improves performance of view transitions.
 *
 * If the browser doesn't support the View Transitions API, the DOM change will be executed without
 * attempting a view transition.
 *
 * @example
 * ```typescript
 * const {
 *     startViewTransition,
 *     isInViewTransition,
 * } = useViewTransition();
 *
 * const doViewTransition = useCallback(() => {
 *     startViewTransition(
 *         // Tell the component to re-render with updated DOM
 *         () => setMyStateVariable((val) => !val)
 *     );
 * }, []);
 *
 * return html`
 *     <div
 *         style="view-transition-name=${
 *             // Apply `view-transition-name` just in time
 *             isInViewTransition
 *                 ? 'unique-name'
 *                 : 'none'
 *         };"
 *     >
 *         <!-- ... -->
 *         <button
 *             type="button"
 *             onClick="${doViewTransition}"
 *         >Update</button>
 *     </div>
 * `;
 * ```
 */
export function useViewTransition(): ViewTransitionState {
	// The function used to update the DOM for a view transition
	const [updateDomFn, setUpdateDomFn] = useState<(() => void) | null>(null);

	// The function that tells the browser we're ready to start a view transition
	const [viewTransitionReadyFn, setViewTransitionReadyFn] = useState<(() => void) | null>(null);

	// Update the DOM, and remember how to tell the browser when we're ready to start a view transition
	useEffect(() => {
		// `updateDomFn` is only ever set when `document.startViewTransition` exists
		if (updateDomFn && document.startViewTransition) {
			const viewTransition = document.startViewTransition(() => new Promise((resolve) => {
				updateDomFn();
				setViewTransitionReadyFn(() => resolve);
				setUpdateDomFn(null);
			}));
			viewTransition.finished.then(() => {
				setViewTransitionReadyFn(null);
			});
		}
	}, [updateDomFn]);

	// After we've re-rendered, tell the browser we're ready to start a view transition
	useEffect(() => {
		if (viewTransitionReadyFn) {
			viewTransitionReadyFn();
		}
	}, [viewTransitionReadyFn]);

	const startViewTransition = useCallback((
		callback: () => void
	) => {
		if (!document.startViewTransition) {
			callback();
			return;
		}

		setUpdateDomFn(() => callback);
	}, []);

	const isInViewTransition = Boolean(updateDomFn || viewTransitionReadyFn);

	return {
		startViewTransition,
		isInViewTransition,
	};
}
