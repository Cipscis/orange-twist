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
// Expose the implementation signature as an overload
// to allow calling from similarly overloaded functions
export function getTaskInfo(taskId?: number): Readonly<TaskInfo>[] | Readonly<TaskInfo> | null
export function getTaskInfo(taskId?: number): Readonly<TaskInfo>[] | Readonly<TaskInfo> | null {
	if (typeof taskId === 'undefined') {
		return Array.from(tasksRegister.values());
	}

	return tasksRegister.get(taskId) ?? null;
}
