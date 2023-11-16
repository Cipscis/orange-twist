import type { DayTaskIdentifier, DayTaskInfo } from './types';
import { dayTasksRegister } from './dayTasksRegister';
import { encodeDayTaskKey } from './util';

/**
 * Returns information for the specified day task, if any exists.
 *
 * @param dayName The name of the day to fetch information for.
 * @param taskId The ID of the task to fetch information for.
 */
export function getDayTaskInfo(): DayTaskInfo[];
export function getDayTaskInfo({ dayName, taskId }: DayTaskIdentifier): DayTaskInfo | null;
export function getDayTaskInfo(identifier?: DayTaskIdentifier): DayTaskInfo[] | DayTaskInfo | null {
	if (typeof identifier === 'undefined') {
		return Array.from(dayTasksRegister.values());
	}

	const key = encodeDayTaskKey(identifier);
	return dayTasksRegister.get(key) ?? null;
}
