import { getIdbRequestPromise, type ExpandType } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a day task for a specified day and task.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY_TASK} object store.
 * @param dayTask An object specifying the day and task for the day task to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved day task, or `null` if no such day task exists.
 */
export async function getDayTaskForDayAndTaskInternal(
	transaction: IDBTransaction,
	dayTask: ExpandType<Pick<
		DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'day' | 'task'
	>>
): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY_TASK][number]
	| null
> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByDayAndTask = dayTaskOS.index(IndexName.DAY_TASK_DAY_TASK);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = dayTaskByDayAndTask.get([dayTask.day, dayTask.task]) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.DAY_TASK][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
