import type { DayTaskIdentifier, DayTaskInfo } from './types';
import { TaskStatus } from 'types/TaskStatus';
import { dayTasksRegister } from './dayTasksRegister';
import { encodeDayTaskKey } from './util';

import { getTaskInfo, setTaskInfo } from 'data/tasks';
import { getDayInfo, setDayInfo } from 'data/days';
import { getAllDayTaskInfo } from './getAllDayTaskInfo';

const defaultDayTaskInfo = {
	status: TaskStatus.TODO,
	note: '',
	summary: null,
} as const satisfies Omit<DayTaskInfo, 'dayName' | 'taskId'>;

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
	const existingDayTaskInfo = dayTasksRegister.get(key);

	// Destructure to avoid extra properties being included, which
	// could potentially override the day task info
	const {
		dayName,
		taskId,
	} = dayTaskIdentifier;

	const newDayTaskInfo: DayTaskInfo = {
		dayName,
		taskId,

		status: dayTaskInfo.status ?? existingDayTaskInfo?.status ?? defaultDayTaskInfo.status,
		note: dayTaskInfo.note ?? existingDayTaskInfo?.note ?? defaultDayTaskInfo.note,
		summary: dayTaskInfo.summary ?? existingDayTaskInfo?.summary ?? defaultDayTaskInfo.summary,
	};

	dayTasksRegister.set(key, newDayTaskInfo);

	const dayInfo = getDayInfo(dayName);
	// If no day exists, create one
	if (dayInfo === null) {
		setDayInfo(dayName, { tasks: [taskId] });
	} else if (dayInfo.tasks.indexOf(taskId) === -1) {
		// If a day exists but it doesn't have this task, add it
		setDayInfo(dayName, {
			tasks: [...dayInfo.tasks, taskId],
		});
	}

	// If no task exists, create one
	if (getTaskInfo(taskId) === null) {
		setTaskInfo(taskId, { status: newDayTaskInfo.status }, { forCurrentDay: false });
	} else {
		// If a task exists and it has no later days with day tasks, update its status

		/** The day names for all day task info objects matching this task, sorted chronologically */
		const matchingDayNames = getAllDayTaskInfo()
			.filter(({ taskId: thisTaskId }) => thisTaskId === taskId).map(({ dayName }) => dayName)
			.sort((dayNameA, dayNameB) => dayNameA.localeCompare(dayNameB));

		const hasLaterDay = matchingDayNames.length > 0 &&
			matchingDayNames[matchingDayNames.length - 1].localeCompare(dayName) > 0;

		if (!hasLaterDay) {
			setTaskInfo(taskId, { status: newDayTaskInfo.status }, { forCurrentDay: false });
		}
	}
}
