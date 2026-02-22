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

import { requestAsyncCallback } from 'utils';

interface AccordionProps {
	class?: string;
	open?: boolean;

	summary: string | JSX.Element;
	summaryClass?: string;
	onToggle?: (event: JSX.TargetedEvent<HTMLDetailsElement, Event>) => void;

	children: ComponentChildren;
}

export function Accordion(props: AccordionProps): JSX.Element {
	const {
		class: className,

		summary,
		summaryClass,
		onToggle,

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

		// Render children within 1.5 seconds
		requestAsyncCallback(() => {
			setRenderChildren(true);
		}, {
			deadline: 1500,
			signal,
		});

		return () => controller.abort();
	}, [renderChildren]);

	const handleToggle: JSX.GenericEventHandler<HTMLDetailsElement> = useCallback((e) => {
		const detailsEl = e.currentTarget;
		setIsOpen(detailsEl.open);
		if (onToggle) {
			onToggle(e);
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
