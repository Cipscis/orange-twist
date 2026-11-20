import type { Task } from '../types';

import { ObjectStoreName } from '../metadata';
import { getAllTasksInternal } from '../internal';

import { requestTransaction } from './requestTransaction';

/**
 * Loads data from all tasks, sorted according to their `sortIndex` property.
 */
export async function loadAllTasks(): Promise<Task[]> {
	const transaction = await requestTransaction([ObjectStoreName.TASK], 'readonly');

	const tasks = await getAllTasksInternal(transaction);

	return tasks;
}
