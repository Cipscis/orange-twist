import type { TaskInfo } from './types';

import { tasksRegister } from './tasksRegister';
import { completePartialTask, getDefaultTaskInfo } from './util';
import { getTaskInfo } from 'data';

/**
 * Sets or updates task info for multiple tasks.
 */
export function setAllTaskInfo(entries: readonly (readonly[
	taskId: number, taskInfo: Partial<Omit<TaskInfo, 'id'>>
])[]): void {
	const fullEntries = entries.map(([taskId, taskInfo]) => {
		const existingTaskInfo = getTaskInfo(taskId);
		if (existingTaskInfo) {
			return [
				taskId,
				completePartialTask(taskInfo, existingTaskInfo),
			] as const;
		}

		const defaultTaskInfo = getDefaultTaskInfo(taskId);
		return [
			taskId,
			completePartialTask(taskInfo, defaultTaskInfo),
		] as const;
	});

	tasksRegister.set(fullEntries);
}
