import type { TaskInfo } from './types';

import { tasksRegister } from './tasksRegister';
import { setTaskInfo } from './setTaskInfo';

/**
 * Determines a number that can be used as the unique ID for a new task,
 * based on which IDs have already been used in the tasks register.
 *
 * @returns A number that can be used as the unique ID for a new task.
 */
function getNextTaskId(): number {
	const highestId = Math.max(...tasksRegister.keys());

	// If this is the first task, use 1 as the initial ID
	if (highestId === -Infinity) {
		return 1;
	}

	return highestId + 1;
}

/**
 * Creates a new task, using default values.
 *
 * @returns The ID of the newly created task.
 */
export function createTask(): number;
/**
 * Creates a new task with specified initial info, filling in any
 * blanks with default values.
 *
 * @param taskInfo Partial data used to initialise the new task.
 */
export function createTask(taskInfo: Partial<Omit<TaskInfo, 'id'>>): number;
export function createTask(taskInfo?: Partial<Omit<TaskInfo, 'id'>>): number {
	const nextTaskId = getNextTaskId();

	setTaskInfo(nextTaskId, { ...taskInfo });

	return nextTaskId;
}
