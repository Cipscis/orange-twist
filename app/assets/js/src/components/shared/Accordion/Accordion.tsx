import {
	h,
	type ComponentChildren,
	type JSX,
} from 'preact';
import type Preact from 'preact';
import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import {
	requestAsyncCallback,
	type DefaultsFor,
} from 'utils';

export interface AccordionProps {
	/**
	 * An optional string to add to th CSS class attribute for the `Accordion`'s `<details>` element.
	 */
	class?: string;
	/**
	 * An external control for the open/closed state of the `Accordion`.
	 *
	 * Setting this does not prevent the `Accordion` from being able to manage its own internal state. But setting or changing it will override that internal state.
	 *
	 * @default {false}
	 */
	open?: boolean;

	/**
	 * The string or JSX to use for the contents of the `Accordion`'s `<summary>` element.
	 */
	summary: string | JSX.Element;
	/**
	 * An optional string to add to the CSS class attribute for the `Accordion`'s `<summary>` element.
	 */
	summaryClass?: string;
	/**
	 * A callback to bind to the `Accordion`'s `<details>` element's `'toggle'` event.
	 *
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/toggle_event `HTMLElement`: toggle event || MDN}
	 */
	onToggle?: (this: HTMLDetailsElement, event: Preact.TargetedEvent<HTMLDetailsElement, Event>) => void;

	/**
	 * The contents of the `Accordion` to show when it is opened.
	 */
	children: ComponentChildren;
}

const accordionDefaultProps = {
	open: false,
	scrollBehaviour: AccordionScrollBehaviour.AUTO,
} as const satisfies DefaultsFor<Omit<AccordionProps, 'class' | 'summaryClass' | 'onToggle'>>;

/**
 * An expandable disclosure component.
 *
 * For `Accordion`s that are initially rendered closed, their children will be rendered asynchronously for performance reasons. If the `Accordion` is opened before this happens, the children will be rendered synchronously at that point.
 */
export function Accordion(props: AccordionProps): JSX.Element {
	const {
		class: className,
		open,

		summary,
		summaryClass,
		onToggle,

		children,
	} = {
		...accordionDefaultProps,
		...props,
	};

	const [isOpen, setIsOpen] = useState(open);

	// Children are not initially rendered for closed `Accordion` components, but will remain rendered once they have been opened.
	const [renderChildren, setRenderChildren] = useState(isOpen);

	// Update open state if prop changes
	useEffect(() => {
		setIsOpen(open);
	}, [open]);

	// If we're not rendering children initially, queue up a render over the next few seconds
	useEffect(() => {
		if (renderChildren) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		// Render children within 1.5 seconds
		requestAsyncCallback(() => {
			setRenderChildren(true);
		}, {
			deadline: 1500,
			signal,
		});

		return () => controller.abort();
	}, [renderChildren]);

	/**
	 * When the `<details>` element is toggled, keep internal `isOpen` state in sync and call `onToggle` callback if available.
	 */
	const handleToggle: Preact.GenericEventHandler<HTMLDetailsElement> = useCallback((e) => {
		const detailsEl = e.currentTarget;
		setIsOpen(detailsEl.open);

		if (onToggle) {
			onToggle.call(detailsEl, e);
		}
	}, [onToggle]);

	return <details
		class={className}
		open={isOpen}
		onToggle={handleToggle}
	>
		<summary class={summaryClass}>{summary}</summary>
		{(renderChildren || isOpen) && children}
	</details>;
}
