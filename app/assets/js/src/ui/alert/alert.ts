import type { ExpandType } from 'util/index';
import type { ToastProps } from './Toast';
import {
	getNextId,
	renderToasts,
	toasts,
} from './toast-controller';

type ToastOptions = ExpandType<Partial<Omit<ToastProps, 'message'>>>;

/**
 * Show a new "toast" alert with a specified message and duration.
 */
export function alert(
	message: ToastProps['message'],
	duration?: ToastProps['duration']
): void;
/**
 * Show a "toast" alert with a specified message. An ID can be passed to
 * create a toast that can be updated by calling this function again
 * with the same ID, if it still exists.
 */
export function alert(
	message: ToastProps['message'],
	options?: ToastOptions
): void;
export function alert(
	message: ToastProps['message'],
	optionsArg?: ToastProps['duration'] | ToastOptions
): void {
	// Start by consolidating arguments
	const options = typeof optionsArg === 'number'
		? { duration: optionsArg }
		: { ...optionsArg };

	// Use a default duration of 2000ms
	// TODO: Need a better approach to this - make dismissable toasts maybe?
	if (typeof options.duration === 'undefined') {
		options.duration = 2000;
	}

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
