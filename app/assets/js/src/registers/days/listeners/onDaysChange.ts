import type { Day } from 'types/Day';

interface DaysChangeListener {
	(days: ReadonlyArray<Readonly<Day>>): void;
}

export const daysChangeListeners: Array<DaysChangeListener> = [];

interface OnDaysChangeOptions {
	/**
	 * An `AbortSignal`. The listener will be removed when the given `AbortSignal`
	 * object's `abort()` method is called. If not specified, no `AbortSignal` is
	 * associated with the listener.
	 */
	signal?: AbortSignal;
}

/**
 * Bind a callback to fire whenever any day is changed.
 */
export function onDaysChange(
	listener: DaysChangeListener,
	options?: OnDaysChangeOptions,
): void {
	if (options?.signal?.aborted) {
		return;
	}

	// Mimic `addEventListener` by not adding duplicate listeners
	if (daysChangeListeners.includes(listener)) {
		return;
	}

	daysChangeListeners.push(listener);

	options?.signal?.addEventListener(
		'abort',
		() => offDaysChange(listener),
	);
}

/**
 * Unbind a callback bound to days changes using {@linkcode onDaysChange}
 */
export function offDaysChange(listener: DaysChangeListener): void {
	const listenerIndex = daysChangeListeners.indexOf(listener);

	// If the listener exists, remove it
	if (listenerIndex !== -1) {
		daysChangeListeners.splice(listenerIndex, 1);
	}
}
