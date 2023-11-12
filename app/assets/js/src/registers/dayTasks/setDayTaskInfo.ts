import type { DayTaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';
import { dayTasksRegister } from './dayTasksRegister';
import { getDayTaskKey } from './getDayTaskKey';

/**
 * Updates the specified day task with the provided information. If the day
 * task has no information already, the blanks will be filled in with defaults.
 *
 * @param dayName The string specifying the name of the day to update.
 * @param taskId The ID specifying the name of the task to update.
 * @param dayInfo The new information to set of the specified day task.
 */
export function setDayTaskInfo(
	dayName: string,
	taskId: number,
	dayTaskInfo: Partial<Omit<DayTaskInfo, 'dayName' | 'taskId'>>
): void {
	const key = getDayTaskKey(dayName, taskId);
	const existingInfo = dayTasksRegister.get(key);

	dayTasksRegister.set(key, {
		dayName,
		taskId,

		note: '',
		status: TaskStatus.TODO,

		...existingInfo,
		...dayTaskInfo,
	});
}
