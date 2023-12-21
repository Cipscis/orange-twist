import { h, type ComponentChildren, type JSX } from 'preact';
import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';

import {
	classNames,
	getDeepActiveElement,
} from 'util/index';
import { IconButton } from './IconButton';

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
	/**
	 * Whether or not to display a button that closes the Modal.
	 * @default false
	 */
	closeButton?: boolean;
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
		closeButton,
	} = props;

	const modalRef = useRef<HTMLDialogElement>(null);
	const preFocusEl = useRef<Element | null>(null);

	// Integrate with `HTMLDialogElement` API, and handle
	// automatic focus management when opening and closing
	useLayoutEffect(() => {
		if (open) {
			preFocusEl.current = getDeepActiveElement();
			modalRef.current?.showModal();
		} else {
			modalRef.current?.close();
			if (preFocusEl.current instanceof HTMLElement) {
				preFocusEl.current.focus();
			}
		}
	}, [open]);

	// Initialise previous open state to `false`
	// so `onOpen` can run on initial render
	const previousOpenStateRef = useRef(false);

	// Handle opening and closing callbacks
	useEffect(() => {
		if (open === previousOpenStateRef.current) {
			return;
		}

		if (open && onOpen) {
			onOpen();
		} else if (!open && onClose) {
			onClose();
		}

		previousOpenStateRef.current = open;
	}, [open, onOpen, onClose]);

	// Handle close event
	useEffect(() => {
		if (!modalRef.current) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		modalRef.current.addEventListener(
			'close',
			onClose,
			{ signal }
		);

		return () => controller.abort();
	}, [onClose]);

	// Add "light dismiss" behaviour - close when clicking backdrop
	useEffect(() => {
		if (!(open && modalRef.current)) {
			return;
		}

		const controller = new AbortController();
		const { signal } = controller;

		modalRef.current.addEventListener(
			'click',
			function (e) {
				if (e.target === this) {
					this.close();
				}
			},
			{ signal }
		);

		return () => controller.abort();
	}, [open]);

	return <dialog
		class="modal"
		tabIndex={-1}
		ref={modalRef}
		data-testid="modal"
	>
		{
			open &&
			<div
				class={classNames('modal__body', className)}
				data-testid="modal__body"
			>
				{
					closeButton &&
					<IconButton
						title="Close modal"
						icon="❌"
						class="modal__close"
					/>
				}
				{
					title &&
					<h2 class="modal__title">{title}</h2>
				}

				{children}
			</div>
		}
	</dialog>;
}
