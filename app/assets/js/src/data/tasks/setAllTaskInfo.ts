import type { TaskInfo } from './types';

import { tasksRegister } from './tasksRegister';
import { getDefaultTaskInfo } from './getDefaultTaskInfo';
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
				{
					id: taskId,
					name: taskInfo.name ?? existingTaskInfo.name,
					status: taskInfo.status ?? existingTaskInfo.status,
					note: taskInfo.note ?? existingTaskInfo.note,
					sortIndex: taskInfo.sortIndex ?? existingTaskInfo.sortIndex,
				},
			] as const;
		}

		const defaultTaskInfo = getDefaultTaskInfo(taskId);
		return [
			taskId,
			{
				id: taskId,
				name: taskInfo.name ?? defaultTaskInfo.name,
				status: taskInfo.status ?? defaultTaskInfo.status,
				note: taskInfo.note ?? defaultTaskInfo.note,
				sortIndex: taskInfo.sortIndex ?? defaultTaskInfo.sortIndex,
			},
		] as const;
	});

	tasksRegister.set(fullEntries);
}
