import type {
	DefaultsFor,
	ExpandType,
} from 'utils';
import type { ToastProps } from './Toast';
import {
	getNextId,
	renderToasts,
	toasts,
} from './toast-controller';

type ToastOptions = ExpandType<Partial<Omit<ToastProps, 'message'>>>;

const defaults = {
	duration: 2000,
	dismissible: false,
} as const satisfies DefaultsFor<Omit<ToastOptions, 'id'>>;

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
		? {
			...defaults,
			duration: optionsArg,
		}
		: {
			...defaults,
			...optionsArg,
		};

	const existingToast = (() => {
		if (typeof options?.id !== 'undefined') {
			return toasts.find((toast) => toast.id === options.id) ?? null;
		}
		return null;
	})();

	if (existingToast) {
		existingToast.message = message;
		const {
			id,
			...propsToOverride
		} = options;
		Object.assign(existingToast, propsToOverride);
	} else {
		const newToast = {
			id: options?.id ?? getNextId(),
			message,
			duration: options.duration ?? null,
			dismissible: options.dismissible,
		};
		toasts.push(newToast);
	}

	renderToasts();
}
