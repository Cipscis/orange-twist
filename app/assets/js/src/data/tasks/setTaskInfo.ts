import type { TaskInfo } from './types';

import { getCurrentDateDayName } from 'util/index';

import { getDayTaskInfo, setDayTaskInfo } from 'data/dayTasks';

import { tasksRegister } from './tasksRegister';
import {
	completePartialTask,
	getDefaultTaskInfo,
	updateRelationships,
} from './util';
import { getTaskInfo } from './getTaskInfo';

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

	const existingTaskInfo = getTaskInfo(taskId);

	const newTaskInfo = (() => {
		// If there is existing task info, use that
		if (existingTaskInfo) {
			return completePartialTask(taskInfo, existingTaskInfo);
		}

		// Otherwise, use default task info to fill in the blanks
		const defaultTaskInfo = getDefaultTaskInfo(taskId);
		return completePartialTask(taskInfo, defaultTaskInfo);
	})();

	// If we're not changing anything, do nothing
	if (existingTaskInfo) {
		if (JSON.stringify(existingTaskInfo) === JSON.stringify(newTaskInfo)) {
			return;
		}
	}

	tasksRegister.set(taskId, newTaskInfo);

	updateRelationships(newTaskInfo, existingTaskInfo);

	if (consolidatedOptions.forCurrentDay && taskInfo.status) {
		const dayName = getCurrentDateDayName();
		if (getDayTaskInfo({ dayName, taskId })?.status !== taskInfo.status) {
			setDayTaskInfo({ dayName, taskId }, { status: taskInfo.status });
		}
	}
}
