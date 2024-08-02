import {
	h,
	type ComponentChildren,
	type JSX,
} from 'preact';
import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

interface AccordionProps {
	className?: string;
	open?: boolean;

	summary: string | JSX.Element;
	summaryClass?: string;

	children: ComponentChildren;
}

export function Accordion(props: AccordionProps): JSX.Element {
	const {
		className,

		summary,
		summaryClass,

		children,
	} = props;
	const open = props.open ?? false;

	const [isOpen, setIsOpen] = useState(open);
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

		/**
		 * Ask the browser to complete a task before a deadline, preferably
		 * when the main thread is idle.
		 */
		const requestCallback = (callback: () => void, deadline: number) => {
			// As of 2024-08-03, Safari doesn't support requestIdleCallback
			if (window.requestIdleCallback) {
				const callbackId = window.requestIdleCallback(callback, { timeout: deadline });
				signal.addEventListener('abort', () => window.cancelIdleCallback(callbackId));
				return;
			}

			// As a fallback, spread timeouts randomly across the deadline period
			const delay = Math.random() * deadline;
			const timeout = setTimeout(callback, delay);
			signal.addEventListener('abort', () => clearTimeout(timeout));
		};

		// Render children within 1.5 seconds
		requestCallback(() => {
			setRenderChildren(true);
		}, 1500);

		return () => controller.abort();
	}, [renderChildren]);

	const handleToggle: JSX.GenericEventHandler<HTMLDetailsElement> = useCallback((e) => {
		const detailsEl = e.currentTarget;
		setIsOpen(detailsEl.open);
	}, []);

	return <details
		class={className}
		open={isOpen}
		onToggle={handleToggle}
	>
		<summary class={summaryClass}>{summary}</summary>
		{(renderChildren || isOpen) && children}
	</details>;
}
