import {
	getIdbRequestPromise,
	getIterableCursor,
	type OptionalExcept,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TASK} object store.
 * @param task An object specifying which task to update by its ID, and providing any values that should be updated.
 *
 * @throws Error if no task exists with the specified ID.
 */
export async function updateTaskInternal(
	transaction: IDBTransaction,
	task: OptionalExcept<DatabaseData[typeof ObjectStoreName.TASK][number], 'id'>
): Promise<void> {
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);

	const requests: Promise<IDBValidKey>[] = [];

	for await (const taskCursor of getIterableCursor(taskOS, task.id)) {
		// This type assertion is safe because of other controls around what can be inserted into the database
		const taskCursorValue = taskCursor.value as DatabaseData[typeof ObjectStoreName.TASK][number];

		const updatedTask = {
			...taskCursorValue,
			...task,
		};

		requests.push(
			getIdbRequestPromise(
				taskCursor.update(updatedTask)
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update task ${task.id} - No such task exists.`);
	}

	await Promise.all(requests);
}
