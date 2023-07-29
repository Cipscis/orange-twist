import { Day } from '../../types/Day.js';
import { isValidDateString } from '../../util/date/isValidDateString.js';

import { daysListChangeListeners } from './listeners/onDaysListChange.js';
import { dayChangeListeners } from './listeners/onDayChange.js';

const daysRegister: Map<string, Readonly<Day>> = new Map();

/**
 * Retrieve the list of all days with data
 */
export function getDaysList(): ReadonlyArray<string> {
	const days = Array.from(daysRegister.keys());

	days.sort((a, b) => a.localeCompare(b));

	return days;
}

/**
 * Retrieve data for a given day, if it exists.
 *
 * If the day doesn't have any data, returns `null`.
 */
export function getDayData(dayName: string): Readonly<Day> | null {
	const day = daysRegister.get(dayName);

	return day ?? null;
}

/**
 * Set data for a given day. If no data exists
 * for this day yet, it will be added.
 */
export function setDayData(dayName: string, data: Partial<Omit<Day, 'date'>>): void {
	if (!isValidDateString(dayName)) {
		throw new RangeError(`Invalid day name ${dayName}`);
	}

	const defaults: Day = {
		date: dayName,
		note: '',
		tasks: [],
	};

	const day = daysRegister.get(dayName);
	const isNewDay = typeof day === 'undefined';

	const newData = {
		...defaults,
		...day,
		...data,
	};
	daysRegister.set(dayName, newData);

	const thisDayChangeListeners = dayChangeListeners.get(dayName) ?? [];
	for (const listener of thisDayChangeListeners) {
		listener(newData);
	}

	// If a new day was added, that means the list of days has changed so
	// we should call any day list change listeners.
	if (isNewDay) {
		const daysList = getDaysList();
		for (const listener of daysListChangeListeners) {
			listener(daysList);
		}
	}
}
