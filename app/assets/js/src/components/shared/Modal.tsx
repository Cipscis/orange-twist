import { h, type ComponentChildren, type JSX } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import {
	classNames,
	useBlurCallback,
	useCloseWatcher,
} from 'util/index';

import { getDeepActiveElement } from '../../util';

interface ModalProps {
	/** The Modal is only rendered when `open` is `true`. */
	open: boolean;

	/**
	 * Called when the Modal is opened. This includes the first
	 * time it is rendered, if `open` is initially `true`.
	 */
	onOpen?: () => void;
	/**
	 * Called when internal behaviour determines that the Modal
	 * should be closed. Can be used in the parent component to
	 * update the `open` prop.
	 *
	 * @example
	 * ```tsx
	 * const [open, setOpen] = useState(false);
	 *
	 * return <Modal
	 *     open={open}
	 *     onClose={() => setOpen(false)}
	 * />;
	 * ```
	 */
	onClose: () => void;

	children?: ComponentChildren;
	/** CSS Classes to apply to the Modal's body element. */
	class?: string;
	/** A title to display as an `<h2>` within the Modal's body element. */
	title?: string;
}

/**
 * A modal window that displays in the center of the viewport
 */
export function Modal(props: ModalProps): JSX.Element {
	const {
		open,

		onOpen,
		onClose,

		children,
		class: className,
		title,
	} = props;

	const modalRef = useRef<HTMLDivElement>(null);
	const preFocusEl = useRef<Element | null>(null);

	// Handle automatic focus management when opening and closing
	useEffect(() => {
		if (open) {
			preFocusEl.current = getDeepActiveElement();
			modalRef.current?.focus();
		} else if (
			(
				document.activeElement === null ||
				document.activeElement === document.body
			) &&
			preFocusEl.current instanceof HTMLElement
		) {
			preFocusEl.current.focus();
		}
	}, [open]);

	// Handle opening callback
	useEffect(() => {
		if (open && onOpen) {
			onOpen();
		}
	}, [open, onOpen]);

	// Handle closing on Escape
	useCloseWatcher(onClose, open);

	// Handle closing on blur
	useBlurCallback(modalRef, onClose, open);

	return <>
		{
			open &&
			<div
				class="modal"
			>
				<div
					class={classNames('modal__body', className)}
					tabIndex={-1}
					ref={modalRef}
					data-testid="modal"
				>
					{
						title &&
						<h2 class="modal__title">{title}</h2>
					}

					{children}
				</div>
			</div>
		}
	</>;
}
