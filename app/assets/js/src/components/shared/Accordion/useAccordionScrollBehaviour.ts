import type Preact from 'preact';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'preact/hooks';

import { assertAllUnionMembersHandled } from 'utils';

import type { Accordion } from './Accordion';
import { AccordionScrollBehaviour } from './AccordionScrollBehaviour';

export interface UseAccordionScrollBehaviourOptions {
	isOpen: boolean;
	renderChildren: boolean;
	scrollBehaviour: AccordionScrollBehaviour;
}

export interface UseAccordionScrollBehaviourRefs {
	detailsRef: Preact.RefObject<HTMLDetailsElement>;
	summaryRef: Preact.RefObject<HTMLElement>;
}

/**
 * Handle the {@linkcode Accordion} component's {@linkcode AccordionScrollBehaviour} prop.
 *
 * @returns a group of refs used to integrate with the markup rendered by the `Accordion` component.
 */
export function useAccordionScrollBehaviour(options: UseAccordionScrollBehaviourOptions): UseAccordionScrollBehaviourRefs {
	const {
		isOpen,
		renderChildren,
		scrollBehaviour,
	} = options;

	const detailsRef = useRef<HTMLDetailsElement>(null);
	const summaryRef = useRef<HTMLElement>(null);
	const detailsBottomPosRef = useRef<number>(0);

	/**
	 * Before the `<details>` element is toggled, record its bottom position for handling scroll behaviour.
	 *
	 * The `'beforetoggle'` event is not yet supported for `'<details>'` elements, so currently this polls on scroll end.
	 * @see {@link https://github.com/whatwg/html/issues/9743 `<details>` element does not fire a `beforetoggle` event.}
	 */
	const recordBottomPosition = useCallback(() => {
		const detailsEl = detailsRef.current;
		if (!detailsEl) {
			return;
		}

		detailsBottomPosRef.current = detailsEl.getBoundingClientRect().bottom;
	}, []);

	/**
	 * Handle any configured scroll behaviour after opening or closing the `Accordion`.
	 */
	const handleScrollBehaviour = useCallback((isOpen: boolean) => {
		if (scrollBehaviour === AccordionScrollBehaviour.AUTO) {
			// Let the browser manage scroll behaviour automatically
			return;
		} else if (scrollBehaviour === AccordionScrollBehaviour.ANCHOR_BOTTOM) {
			const summaryEl = summaryRef.current;
			const detailsEl = detailsRef.current;
			if (!(summaryEl && detailsEl)) {
				return;
			}

			const amountToScroll = (() => {
				const summaryBottomPos = summaryEl.getBoundingClientRect().bottom;
				if (isOpen) {
					// If we're opening, use the new bottom position of the details element to figure out where to put the summary
					const detailsBottomPos = detailsEl.getBoundingClientRect().bottom;

					return detailsBottomPos - summaryBottomPos;
				} else {
					// If we're closing, use the old bottom position of the details element to figure out where to put the summary
					const detailsBottomPos = detailsBottomPosRef.current;

					return summaryBottomPos - detailsBottomPos;
				}
			})();

			scrollBy({
				top: amountToScroll,
				behavior: 'instant',
			});
		} else {
			assertAllUnionMembersHandled(scrollBehaviour);
		}
	}, [scrollBehaviour]);

	// If necessary for scroll behaviour, keep track of positions on scroll end
	useEffect(() => {
		if (scrollBehaviour === AccordionScrollBehaviour.AUTO) {
			return;
		} else if (scrollBehaviour === AccordionScrollBehaviour.ANCHOR_BOTTOM) {
			// We only need to keep track of the bottom position on scroll when the `Accordion` is open
			if (isOpen) {
				return;
			}

			const controller = new AbortController();
			const { signal } = controller;

			document.addEventListener('scrollend', recordBottomPosition, { signal });

			return () => controller.abort();
		} else {
			assertAllUnionMembersHandled(scrollBehaviour);
		}
	}, [scrollBehaviour, isOpen, recordBottomPosition]);

	// If necessary for scroll behaviour, keep track of positions when children are rendered
	useEffect(() => {
		if (scrollBehaviour === AccordionScrollBehaviour.AUTO) {
			return;
		} else if (scrollBehaviour === AccordionScrollBehaviour.ANCHOR_BOTTOM) {
			if (renderChildren) {
				recordBottomPosition();
			}
		} else {
			assertAllUnionMembersHandled(scrollBehaviour);
		}
	}, [scrollBehaviour, renderChildren, recordBottomPosition]);

	// Handle scroll behaviour synchronously when opening or closing
	useLayoutEffect(() => {
		if (scrollBehaviour === AccordionScrollBehaviour.AUTO) {
			return;
		} else if (scrollBehaviour === AccordionScrollBehaviour.ANCHOR_BOTTOM) {
			handleScrollBehaviour(isOpen);
			recordBottomPosition();
		} else {
			assertAllUnionMembersHandled(scrollBehaviour);
		}
	}, [
		scrollBehaviour,
		isOpen,
		handleScrollBehaviour,
		recordBottomPosition,
	]);

	return {
		detailsRef,
		summaryRef,
	};
}
