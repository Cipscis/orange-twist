import { Day } from '../../../types/Day.js';

interface DaysChangeListener {
	(days: ReadonlyArray<Readonly<Day>>): void;
}

export const daysChangeListeners: Array<DaysChangeListener> = [];

/**
 * Bind a callback to fire whenever any day is changed.
 */
export function onDaysChange(listener: DaysChangeListener): void {
	// Mimic `addEventListener` by not adding duplicate listeners
	if (daysChangeListeners.includes(listener)) {
		return;
	}

	daysChangeListeners.push(listener);
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
