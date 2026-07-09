import {
	getIdbRequestPromise,
	getIterableCursor,
	type OptionalExcept,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getStatusInternal } from './getStatusInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing day task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY_TASK} and {@linkcode ObjectStoreName.STATUS} object stores.
 * @param dayTask An object specifying which day task to update by its ID, and providing any values that should be updated.
 *
 * @returns a {@linkcode Promise} that resolves with the ID of the updated day task, once the update is complete.
 *
 * @throws Error if no day task exists with the specified day and task IDs.
 * @throws Error if no status exists with the specified status ID.
 */
export async function updateDayTaskInternal(
	transaction: IDBTransaction,
	dayTask: OptionalExcept<
		DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'id'
	>
): Promise<number> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const requests: Promise<IDBValidKey>[] = [];

	for await (const dayTaskCursor of getIterableCursor(dayTaskOS, dayTask.id)) {
		// This type assertion is safe because of other controls around what can be inserted into the database
		const dayTaskCursorValue = dayTaskCursor.value as DatabaseData[typeof ObjectStoreName.DAY_TASK][number];

		if (
			('day' in dayTask && dayTask.day !== dayTaskCursorValue.day) ||
			('task' in dayTask && dayTask.task !== dayTaskCursorValue.task)
		) {
			throw new Error(`The day and task properties of a day task are immutable and cannot be modified.`);
		}

		if (typeof dayTask.status === 'number') {
			const status = await getStatusInternal(transaction, dayTask.status);
			if (status === null) {
				throw new Error(`Could not apply status ID ${dayTask.status} to day task ${dayTask.id} - No such status exists.`);
			}
		}

		requests.push(
			getIdbRequestPromise(
				dayTaskCursor.update({
					...dayTaskCursorValue,
					...dayTask,
				})
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update day task ${dayTask.id}`);
	}

	await Promise.all(requests);

	return dayTask.id;
}
