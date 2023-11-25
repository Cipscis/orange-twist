import type { TaskInfo } from './types';

import { tasksRegister } from './tasksRegister';

/**
 * Returns information on every task.
 */
export function getAllTaskInfo(): Readonly<TaskInfo>[] {
	return Array.from(tasksRegister.values());
}
