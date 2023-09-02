import { ComponentChildren, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import htm from 'htm';
import classNames from 'classnames';

import { getDeepActiveElement, nodeHasAncestor } from '../../util/index.js';

// Initialise htm with Preact
const html = htm.bind(h);

interface ModalProps {
	open: boolean;
	onClose: () => void;

	children: ComponentChildren;
	className?: string;
	title?: string;
}

export function Modal(props: ModalProps) {
	const {
		open,
		onClose,

		children,
		className,
		title,
	} = props;

	const modalRef = useRef<HTMLElement>(null);
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
			if (
				document.activeElement instanceof Node && modalEl &&
				(
					document.activeElement === modalEl ||
					nodeHasAncestor(document.activeElement, modalEl)
				)
			) {
				return;
			}

			onClose();
		};

		if (open) {
			document.addEventListener('keydown', closeOnEscape);
			modalEl?.addEventListener('focusout', closeOnFocusOut);
		}

		return () => {
			if (open) {
				document.removeEventListener('keydown', closeOnEscape);
				modalEl?.removeEventListener('focusout', closeOnFocusOut);
			}
		};
	}, [open, onClose]);

	return html`
		${
			open &&
			html`
				<div
					class="modal"
				>
					<div
						class="${classNames('modal__body', className)}"
						tabindex="0"
						ref="${modalRef}"
					>
						${
							title &&
							html`<h2 class="modal__title">${title}</h2>`
						}

						${children}
					</div>
				</div>
			`
		}
	`;
}
