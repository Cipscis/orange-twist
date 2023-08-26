import { h, render } from 'preact';
import htm from 'htm';
import { useRef } from 'preact/hooks';
import { CSSKeyframes } from '../util/CSSKeyframes.js';

// Initialise htm with Preact
const html = htm.bind(h);

export interface ToastProps {
	id: number;
	message: string;
	duration?: number;
}

const toasts: Array<ToastProps> = [];

const toastContainer = document.createElement('div');
toastContainer.classList.add('toast');
document.body.append(toastContainer);

let nextId = 1;
/**
 * Gets a unique ID for the next toast.
 */
function getNextId(): number {
	const id = nextId;
	nextId += 1;
	return id;
}

export function Toast(props: ToastProps) {
	const {
		id,
		message,
		duration,
	} = props;

	const toastRef = useRef<HTMLElement>(null);

	if (duration) {
		// Remove the toast after a timeout
		window.setTimeout(() => {
			// Animate out
			if (toastRef.current) {
				toastRef.current.style.animationName = CSSKeyframes.DISAPPEAR_UP;
				const animation = toastRef.current.getAnimations()[0];

				animation.finished.then(() => {
					const toastIndex = toasts.findIndex((toast) => toast.id === id);
					if (toastIndex !== -1) {
						toasts.splice(toastIndex, 1);
						renderToasts();
					}
				});
			}
		}, duration);
	}

	return html`
		<div
			ref="${toastRef}"
			class="toast__message"
		>${message}</div>
	`;
}

const renderToasts = () => {
	render(toasts.map((toast) => html`
		<${Toast}
			key="${toast.id}"
			...${toast}
		/>
	`), toastContainer);
};

export function toast(message: string, duration?: number): void {
	const newToast = {
		id: getNextId(),
		message,
		duration,
	};
	toasts.push(newToast);

	renderToasts();
}
