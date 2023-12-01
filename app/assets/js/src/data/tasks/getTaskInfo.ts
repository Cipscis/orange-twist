import type { TaskInfo } from './types';

import { tasksRegister } from './tasksRegister';

/**
 * Returns information for the specified task, if any exists.
 *
 * @param taskId The ID of the task to fetch information for.
 */
export function getTaskInfo(taskId: number): Readonly<TaskInfo> | null {
	return tasksRegister.get(taskId) ?? null;
}
