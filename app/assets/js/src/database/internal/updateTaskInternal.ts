import {
	getIdbRequestPromise,
	getIterableCursor,
	type ExpandType,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';
import { getStatusInternal } from './getStatusInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TASK} and {@linkcode ObjectStoreName.STATUS} object stores.
 * @param task An object specifying which day to update by its ID, and providing any values that should be updated.
 *
 * @throws Error if no task exists with the specified ID.
 * @throws Error if no status exists with the specified status ID.
 */
export async function updateTaskInternal(
	transaction: IDBTransaction,
	task: ExpandType<
		Pick<DatabaseData[typeof ObjectStoreName.TASK][number], 'id'> &
		Partial<
			Omit<
				DatabaseData[typeof ObjectStoreName.TASK][number],
				'id'
			>
			>
	>
): Promise<void> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	const requests: Promise<IDBValidKey>[] = [];

	for await (const taskCursor of getIterableCursor(taskOS, task.id)) {
		if (typeof task.status === 'number') {
			const status = await getStatusInternal(transaction, task.status);
			if (status === null) {
				throw new Error(`Could not apply status ID ${task.status} to task ${task.id} - No such status exists.`);
			}
		}

		requests.push(
			getIdbRequestPromise(
				taskCursor.update({
					...taskCursor.value,
					...task,
				})
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update task ${task.id} - No such task exists.`);
	}

	await Promise.all(requests);
}
