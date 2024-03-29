import type { TaskInfo } from './types';

import { getCurrentDateDayName } from 'utils';

import { tasksRegister } from './tasksRegister';
import { getDayTaskInfo, setDayTaskInfo } from 'data/dayTasks';
import { getDefaultTaskInfo } from './getDefaultTaskInfo';

interface SetTaskInfoOptions {
	/**
	 * Whether or not the task info being set should be considered as
	 * being for the current day. If true, then any status change will
	 * also be reflected in the day task for this task on the current day.
	 *
	 * @default true
	 */
	forCurrentDay?: boolean;
}

const defaultOptions = {
	forCurrentDay: true,
} as const satisfies Required<SetTaskInfoOptions>;

/**
 * Updates the specified task with the provided information. If the task
 * has no information already, the blanks will be filled in with defaults.
 *
 * @param taskId The unique ID specifying the task to update.
 * @param taskInfo The new information to set of the specified task.
 */
export function setTaskInfo(
	taskId: number,
	taskInfo: Partial<Omit<TaskInfo, 'id'>>,
	options?: SetTaskInfoOptions
): void {
	const consolidatedOptions = {
		...defaultOptions,
		...options,
	};

	const existingTaskInfo = tasksRegister.get(taskId);
	if (existingTaskInfo) {
		tasksRegister.set(taskId, {
			id: taskId,

			name: taskInfo.name ?? existingTaskInfo?.name,
			status: taskInfo.status ?? existingTaskInfo?.status,
			note: taskInfo.note ?? existingTaskInfo?.note,
			sortIndex: taskInfo.sortIndex ?? existingTaskInfo?.sortIndex,
		});
	} else {
		const defaultTaskInfo = getDefaultTaskInfo(taskId);
		tasksRegister.set(taskId, {
			id: taskId,

			name: taskInfo.name ?? defaultTaskInfo.name,
			status: taskInfo.status ?? defaultTaskInfo.status,
			note: taskInfo.note ?? defaultTaskInfo.note,
			sortIndex: taskInfo.sortIndex ?? defaultTaskInfo.sortIndex,
		});
	}

	if (consolidatedOptions.forCurrentDay && taskInfo.status) {
		const dayName = getCurrentDateDayName();
		if (getDayTaskInfo({ dayName, taskId })?.status !== taskInfo.status) {
			setDayTaskInfo({ dayName, taskId }, { status: taskInfo.status });
		}
	}
}
