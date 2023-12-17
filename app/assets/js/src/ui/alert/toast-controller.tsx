import { h, render } from 'preact';

import { Toast, type ToastProps } from './Toast';

import {
	tryStartViewTransition,
	type DefaultsFor,
} from 'util/index';

export const toasts: Array<ToastProps> = [];

const toastContainer = document.createElement('div');
toastContainer.classList.add('toast__container');
document.body.append(toastContainer);

/**
 * Removes a specified toast from the list of toasts.
 */
export function removeToast(idToRemove: string | number): void {
	const toastToRemoveIndex = toasts.findIndex((toast) => toast.id === idToRemove);
	if (toastToRemoveIndex !== -1) {
		toasts.splice(toastToRemoveIndex, 1);
	}
}

interface RenderToastsOptions {
	viewTransition?: boolean;
}

const renderToastDefaults = {
	viewTransition: false,
} as const satisfies DefaultsFor<RenderToastsOptions>;

/**
 * Renders all toasts.
 */
export const renderToasts = (options?: RenderToastsOptions): void => {
	const fullOptions = {
		...renderToastDefaults,
		...options,
	};

	const updateDOM = () => {
		render(toasts.map((toast) => (
			<Toast
				key={toast.id}
				{...toast}
			/>
		)), toastContainer);
	};

	if (fullOptions.viewTransition) {
		tryStartViewTransition(updateDOM);
	} else {
		updateDOM();
	}
};

let nextId = 1;
/**
 * Gets a unique ID for the next toast.
 */
export function getNextId(): number {
	const id = nextId;
	nextId += 1;
	return id;
}
