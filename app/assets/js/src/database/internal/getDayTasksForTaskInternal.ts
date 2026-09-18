import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DayTask } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all day tasks for a specified task.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY_TASK} object store.
 * @param taskId The ID of the task whose day tasks should be retrieved.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all day tasks linked to the specified task, sorted according to their `sortIndex` property.
 */
export async function getDayTasksForTaskInternal(
	transaction: IDBTransaction,
	taskId: number,
): Promise<
	DayTask[]
> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByTask = dayTaskOS.index(IndexName.DAY_TASK_TASK);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = dayTaskByTask.getAll(taskId) as IDBRequest<
		DayTask[]
	>;

	const dayTasks = await getIdbRequestPromise(request);

	const sortedDayTasks = sortBySortIndex(dayTasks);

	return sortedDayTasks;
}
