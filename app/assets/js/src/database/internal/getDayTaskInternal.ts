import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a day task by its ID.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY_TASK} object store.
 * @param dayTask An object specifying the day and task for the day task to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved day task, or `null` if no such day task exists.
 */
export async function getDayTaskInternal(
	transaction: IDBTransaction,
	dayTaskId: number
): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY_TASK][number]
	| null
> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = dayTaskOS.get(dayTaskId) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.DAY_TASK][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
