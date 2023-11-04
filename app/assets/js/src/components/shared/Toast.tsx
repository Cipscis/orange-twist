import { h, render, type JSX } from 'preact';
import { useRef } from 'preact/hooks';

import {
	animate,
	CSSKeyframes,
} from '../../util';

interface ToastProps {
	/**
	 * Automatically generated IDs are numbers, specified IDs are strings.
	 */
	id: number | string;
	message: string;
	/**
	 * The duration, in milliseconds, that a toast should stay on-screen.
	 * If the toast is ever re-rendered, the duration will be restarted.
	 *
	 * A `null` duration means the toast is persistent.
	 */
	duration: number | null;
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

/**
 * Renders a toast, which may automatically hide itself after a delay.
 */
export function Toast(props: ToastProps): JSX.Element {
	const {
		id,
		message,
		duration,
	} = props;

	const toastRef = useRef<HTMLDivElement>(null);
	const timeout = useRef<number | null>(null);

	// Reset the timeout for removing the toast on every render
	if (timeout.current !== null) {
		window.clearTimeout(timeout.current);
		timeout.current = null;
	}

	if (duration !== null) {
		// Remove the toast after a timeout
		timeout.current = window.setTimeout(async () => {
			// Animate out
			if (toastRef.current) {
				const animation = await animate(toastRef.current, CSSKeyframes.DISAPPEAR_UP);
				// TODO: If a toast with the same ID is updated while it's animating out, it won't re-show
				if (animation) {
					await animation.finished;
				}

				const toastIndex = toasts.findIndex((toast) => toast.id === id);
				if (toastIndex !== -1) {
					toasts.splice(toastIndex, 1);
					renderToasts();
				}
			}
		}, duration);
	}

	return <div
		ref={toastRef}
		class="toast__message"
	>{message}</div>;
}

const renderToasts = () => {
	render(toasts.map((toast) => (
		<Toast
			key={toast.id}
			{...toast}
		/>
	)), toastContainer);
};

type ToastOptions = Partial<Omit<ToastProps, 'message'>>;

/**
 * Show a new toast with a specified message and duration.
 */
export function toast(message: string, duration?: ToastProps['duration']): void;
/**
 * Show a toast with a specified message. An ID can be passed to
 * create a toast that can be updated by calling this function again
 * with the same ID, if it still exists.
 */
export function toast(message: string, options?: ToastOptions): void;
export function toast(message: string, optionsArg?: ToastProps['duration'] | ToastOptions): void {
	// Start by consolidating arguments
	const options = typeof optionsArg === 'number' ? { duration: optionsArg } : { ...optionsArg };

	const existingToast = (() => {
		if (typeof options?.id !== 'undefined') {
			return toasts.find((toast) => toast.id === options.id) ?? null;
		}
		return null;
	})();

	if (existingToast) {
		existingToast.message = message;
		if (typeof options.duration !== 'undefined') {
			existingToast.duration = options.duration;
		}
	} else {
		const newToast = {
			id: options?.id ?? getNextId(),
			message,
			duration: options.duration ?? null,
		};
		toasts.push(newToast);
	}

	renderToasts();
}
