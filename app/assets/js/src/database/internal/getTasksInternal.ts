import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Task } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a list of tasks based on a provided list of IDs.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TASK} object store.
 * @param ids A list of numeric task IDs.
 *
 * @returns A {@linkcode Promise} that resolves to an array containing each task with an ID in the `ids` param, in the same order as those IDs are provided.
 */
export async function getTasksInternal(
	transaction: IDBTransaction,
	ids: Iterable<number>,
): Promise<
	(Task | null)[]
> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	const requests: IDBRequest<Task | undefined>[] = [];
	for (const id of ids) {
		// This type assertion is safe because of other controls around what can be inserted into the database
		const request = taskOS.get(id) as IDBRequest<Task | undefined>;
		requests.push(request);
	}

	// Just wait for the last request to fulfill to save on function overhead
	const lastRequest = requests.at(-1);
	if (lastRequest) {
		await getIdbRequestPromise(lastRequest);
	}

	const tasks = requests.map(({ result }) => result ?? null);

	return tasks;
}
