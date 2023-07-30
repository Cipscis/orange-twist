import { Day } from '../../../types/Day.js';

interface DayChangeListener {
	(day: Day | null): void;
}

export const dayChangeListeners: Map<string, Array<DayChangeListener>> = new Map();

/**
 * Bind a callback to fire whenever data for a specified day is changed.
 */
export function onDayChange(dayName: string, listener: DayChangeListener): void {
	const listeners = dayChangeListeners.get(dayName) ?? [];

	// Mimic `addEventListener` by not adding duplicate listeners
	if (listeners.includes(listener)) {
		return;
	}

	listeners.push(listener);
	dayChangeListeners.set(dayName, listeners);
}

/**
 * Unbind a callback bound for a specified day using {@linkcode onDayChange}
 */
export function offDayChange(dayName: string, listener: DayChangeListener): void {
	const listeners = dayChangeListeners.get(dayName);

	if (!listeners) {
		return;
	}

	const listenerIndex = listeners.indexOf(listener);

	// If the listener exists, remove it
	if (listenerIndex !== -1) {
		listeners.splice(listenerIndex, 1);
	}
	dayChangeListeners.set(dayName, listeners);
}
