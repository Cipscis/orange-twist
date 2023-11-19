import type { DayInfo } from './types';

import { isValidDateString } from 'util/index';

import { daysRegister } from './daysRegister';
import { getDayTaskInfo, setDayTaskInfo, type DayTaskInfo } from 'data/dayTasks';
import { getTaskStatusForDay } from 'data/util/getTaskStatusForDay';

const defaultDayInfo = {
	note: '',
	// Use a getter to return a new array each time
	get tasks() { return []; },
} as const satisfies Omit<DayInfo, 'name'>;

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
	const newDayInfo: DayInfo = {
		name: dayName,

		note: dayInfo.note ?? existingDayInfo?.note ?? defaultDayInfo.note,
		tasks: Array.from(dayInfo.tasks ?? existingDayInfo?.tasks ?? defaultDayInfo.tasks),
	};
	daysRegister.set(dayName, newDayInfo);

	for (const taskId of newDayInfo.tasks) {
		if (getDayTaskInfo({ dayName, taskId }) === null) {
			const dayTaskInfo: Partial<DayTaskInfo> = {};

			const status = getTaskStatusForDay({ dayName, taskId });
			if (status !== null) {
				dayTaskInfo.status = status;
			}

			setDayTaskInfo({ dayName, taskId }, dayTaskInfo);
		}
	}
}
