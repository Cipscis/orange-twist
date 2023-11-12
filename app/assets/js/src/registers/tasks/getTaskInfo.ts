import type { TaskInfo } from './types';

import { tasksRegister } from './tasksRegister';

/**
 * Returns information on every task.
 */
export function getTaskInfo(): Readonly<TaskInfo>[];
/**
 * Returns information for the specified task, if any exists.
 *
 * @param taskId The ID of the task to fetch information for.
 */
export function getTaskInfo(taskId: number): Readonly<TaskInfo> | null;
/**
 * Returns information for a list of specified tasks.
 *
 * @param taskIds An array of IDs of the tasks to fetch information for.
 */
export function getTaskInfo(taskIds: number[]): (Readonly<TaskInfo> | null)[];
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function getTaskInfo(
	taskIds?: number | number[]
): Readonly<TaskInfo>[] | Readonly<TaskInfo> | null;
export function getTaskInfo(
	taskIds?: number | number[]
): Readonly<TaskInfo>[] | Readonly<TaskInfo> | null | (Readonly<TaskInfo> | null)[] {
	if (typeof taskIds === 'undefined') {
		return Array.from(tasksRegister.values());
	}

	if (typeof taskIds === 'number') {
		return tasksRegister.get(taskIds) ?? null;
	}

	return taskIds.map((taskId) => tasksRegister.get(taskId) ?? null);
}
