import type { DayTaskIdentifier, DayTaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';
import { dayTasksRegister } from './dayTasksRegister';
import { encodeDayTaskKey } from './util';

/**
 * Updates the specified day task with the provided information. If the day
 * task has no information already, the blanks will be filled in with defaults.
 *
 * @param dayName The string specifying the name of the day to update.
 * @param taskId The ID specifying the name of the task to update.
 * @param dayInfo The new information to set of the specified day task.
 */
export function setDayTaskInfo(
	dayTaskIdentifier: DayTaskIdentifier,
	dayTaskInfo: Partial<Omit<DayTaskInfo, 'dayName' | 'taskId'>>
): void {
	const key = encodeDayTaskKey(dayTaskIdentifier);
	const existingInfo = dayTasksRegister.get(key);

	// Destructure to avoid extra properties being included, which
	// could potentially override the day task info
	const {
		dayName,
		taskId,
	} = dayTaskIdentifier;

	dayTasksRegister.set(key, {
		note: '',
		status: TaskStatus.TODO,

		...existingInfo,
		...dayTaskInfo,

		dayName,
		taskId,
	});
}
