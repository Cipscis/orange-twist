import { h, type ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import classNames from 'classnames';

import { getDeepActiveElement, nodeHasAncestor } from '../../util';

interface ModalProps {
	open: boolean;

	onOpen?: () => void;
	onClose: () => void;

	children: ComponentChildren;
	class?: string;
	title?: string;
}

export function Modal(props: ModalProps) {
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

	useEffect(() => {
		if (open) {
			preFocusEl.current = getDeepActiveElement();
			modalRef.current?.focus();
		} else if (
			document.activeElement === null &&
			preFocusEl.current instanceof HTMLElement
		) {
			preFocusEl.current.focus();
		}
	}, [open]);

	// Handle opening and closing.
	useEffect(() => {
		const closeOnEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		const modalEl = modalRef.current;

		const closeOnFocusOut = (e: FocusEvent) => {
			// Ignore `focusout` triggered by focus leaving the viewport,
			// such as switching to another tab or focusing on the dev tools
			const activeElement = document.activeElement;

			if (
				activeElement instanceof Node && modalEl &&
				(
					activeElement === modalEl ||
					nodeHasAncestor(activeElement, modalEl)
				)
			) {
				return;
			}

			onClose();
		};

		const eventListenerAbortController = new AbortController();
		const { signal } = eventListenerAbortController;

		if (open) {
			if (onOpen) {
				onOpen();
			}

			document.addEventListener('keydown', closeOnEscape, { signal });
			modalEl?.addEventListener('focusout', closeOnFocusOut, { signal });
		}

		return () => {
			if (open) {
				eventListenerAbortController.abort();
			}
		};
	}, [open, onClose, onOpen]);

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
