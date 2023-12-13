import type { TaskInfo } from './types';

import { getCurrentDateDayName } from 'util/index';

import { tasksRegister } from './tasksRegister';
import { TaskStatus } from 'types/TaskStatus';
import { getDayTaskInfo, setDayTaskInfo } from 'data/dayTasks';

/**
 * Determine default task info, used to fill in any blanks.
 */
function getDefaultTaskInfo(taskId: number): Omit<TaskInfo, 'id'> {
	return {
		name: 'New task',
		status: TaskStatus.TODO,
		note: '',
		sortIndex: -Math.abs(taskId),
	};
}

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
	const defaultTaskInfo = getDefaultTaskInfo(taskId);
	tasksRegister.set(taskId, {
		id: taskId,

		name: taskInfo.name ?? existingTaskInfo?.name ?? defaultTaskInfo.name,
		status: taskInfo.status ?? existingTaskInfo?.status ?? defaultTaskInfo.status,
		note: taskInfo.note ?? existingTaskInfo?.note ?? defaultTaskInfo.note,
		sortIndex: taskInfo.sortIndex ?? existingTaskInfo?.sortIndex ?? defaultTaskInfo.sortIndex,
	});

	if (consolidatedOptions.forCurrentDay && taskInfo.status) {
		const dayName = getCurrentDateDayName();
		if (getDayTaskInfo({ dayName, taskId })?.status !== taskInfo.status) {
			setDayTaskInfo({ dayName, taskId }, { status: taskInfo.status });
		}
	}
}
