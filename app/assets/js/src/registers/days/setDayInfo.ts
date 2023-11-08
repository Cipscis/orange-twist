import type { DayInfo } from './types';

import { isValidDateString } from 'util/index';

import { daysRegister } from './daysRegister';

/**
 * Updates the specified day with the provided information. If the day
 * has no information already, the blanks will be filled in with defaults.
 *
 * @param dayName The string specifying the name of the day to update.
 * @param dayInfo The new information to set of the specified day.
 */
export function setDayInfo(
	dayName: string,
	dayInfo: Partial<Omit<DayInfo, 'name'>>
): void {
	if (!isValidDateString(dayName)) {
		throw new Error(`Cannot set day info for invalid day ${dayName}`);
	}

	const existingDayInfo = daysRegister.get(dayName);
	daysRegister.set(dayName, {
		name: dayName,
		note: '',
		tasks: [],

		...existingDayInfo,
		...dayInfo,
	});
}
