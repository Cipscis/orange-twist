import type { RefObject } from 'preact';
import { useEffect } from 'preact/hooks';

import { nodeHasAncestor } from './nodeHasAncestor';

/**
 * Bind a callback to fire when focus leaves an HTML element contained
 * within a ref, but not if the tab itself leaves focus.
 *
 * Optionally, the callback is only applied when a set condition is true.
 */
export function useBlurCallback(
	ref: RefObject<HTMLElement>,
	callback: () => void,
	condition?: boolean
): void {
	useEffect(() => {
		if (condition === false) {
			return;
		}

		if (!ref.current) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		const isInRefElement = (el: unknown) => {
			if (!ref.current) {
				return;
			}

			return el === ref.current || (
				el instanceof Node &&
				nodeHasAncestor(el, ref.current)
			);
		};

		ref.current.addEventListener(
			'focusout',
			async (e) => {
				const focusElement = e.relatedTarget;

				// Don't call callback if focus is still in the element
				if (isInRefElement(focusElement)) {
					return;
				}

				// Wait until we've completed the event loop,
				// so we can check what element receives focus
				await new Promise<void>((resolve) => queueMicrotask(resolve));
				const activeElement = document.activeElement;

				// Don't close if focus has left the tab but will
				// return to our ref element when the tab regains it
				if (
					focusElement === null &&
					isInRefElement(activeElement)
				) {
					return;
				}

				callback();
			},
			{ signal }
		);

		return () => controller.abort();
	}, [ref, callback, condition]);
}
