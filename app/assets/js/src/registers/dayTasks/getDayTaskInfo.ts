import type { DayTaskInfo } from './types';
import { dayTasksRegister } from './dayTasksRegister';
import { getDayTaskKey } from './getDayTaskKey';

/**
 * Returns information for the specified day task, if any exists.
 *
 * @param dayName The name of the day to fetch information for.
 * @param taskId The ID of the task to fetch information for.
 */
export function getDayTaskInfo(dayName: string, taskId: number): DayTaskInfo | null {
	const key = getDayTaskKey(dayName, taskId);
	return dayTasksRegister.get(key) ?? null;
}
