import { ComponentChildren, h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

import htm from 'htm';

import { getDeepActiveElement } from '../../util/index.js';

// Initialise htm with Preact
const html = htm.bind(h);

interface ModalProps {
	open: boolean;
	onClose: () => void;

	children: ComponentChildren;
}

export function Modal(props: ModalProps) {
	const {
		open,
		onClose,
		children,
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

		if (open) {
			document.addEventListener('keydown', closeOnEscape);
			modalEl?.addEventListener('focusout', onClose);
		}

		return () => {
			if (open) {
				document.removeEventListener('keydown', closeOnEscape);
				modalEl?.removeEventListener('focusout', onClose);
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
						class="modal__body"
						tabindex="0"
						ref="${modalRef}"
					>
						${children}
					</div>
				</div>
			`
		}
	`;
}
