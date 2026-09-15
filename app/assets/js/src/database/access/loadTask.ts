import type { Task } from '../types';
import { ObjectStoreName } from '../metadata';
import { getTaskInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single task.
 */
export async function loadTask(id: number): Promise<Task | null> {
	const transaction = await requestTransaction([ObjectStoreName.TASK], 'readonly');

	const task = await getTaskInternal(transaction, id);

	return task;
}
