interface DayListChangeListener {
	(days: ReadonlyArray<string>): void;
}

export const daysListChangeListeners: Array<DayListChangeListener> = [];
/**
 * Bind a callback to fire whenever the list of
 * days is changed.
 */

export function onDaysListChange(listener: DayListChangeListener): void {
	// Mimic `addEventListener` by not adding duplicate listeners
	if (daysListChangeListeners.includes(listener)) {
		return;
	}

	daysListChangeListeners.push(listener);
}

/**
 * Unbind a callback bound for a specified day using {@linkcode onDaysListChange}
 */
export function offDaysListChange(listener: DayListChangeListener): void {
	const listenerIndex = daysListChangeListeners.indexOf(listener);

	// If the listener exists, remove it
	if (listenerIndex !== -1) {
		daysListChangeListeners.splice(listenerIndex, 1);
	}
}
