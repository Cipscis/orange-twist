import {
	h,
	type ComponentChildren,
	type JSX,
} from 'preact';
import {
	useCallback,
	useState,
} from 'preact/hooks';

interface AccordionProps {
	className?: string;
	initiallyOpen?: boolean;

	summary: string | JSX.Element;
	summaryClass?: string;

	children: ComponentChildren;
}

export function Accordion(props: AccordionProps): JSX.Element {
	const {
		className,
		initiallyOpen,

		summary,
		summaryClass,

		children,
	} = props;

	const [isOpen, setIsOpen] = useState(initiallyOpen);

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
		{isOpen && children}
	</details>;
}
