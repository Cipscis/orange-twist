import {
	getIdbRequestPromise,
	getIterableCursor,
	type OptionalExcept,
} from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getStatusInternal } from './getStatusInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing day task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY_TASK} and {@linkcode ObjectStoreName.STATUS} object stores.
 * @param dayTask An object specifiny which day task to update by the IDs of its day and task, and providing any values that should be updated.
 *
 * @returns a {@linkcode Promise} that resolves with the ID of the updated day task, once the update is complete.
 *
 * @throws Error if no day task exists with the specified day and task IDs.
 * @throws Error if no status exists with the specified status ID.
 */
export async function updateDayTaskInternal(
	transaction: IDBTransaction,
	dayTask: OptionalExcept<
		Omit<DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'id'>,
		'day' | 'task'
	>
): Promise<number> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const dayTaskByDayAndTask = dayTaskOS.index(IndexName.DAY_TASK_DAY_TASK);

	const requests: Promise<IDBValidKey>[] = [];
	let dayTaskId: number | undefined;

	for await (const dayTaskCursor of getIterableCursor(dayTaskByDayAndTask, [dayTask.day, dayTask.task])) {
		// TODO: Find a type-safe way to do this
		const dayTaskCursorValue = (dayTaskCursor.value as DatabaseData[typeof ObjectStoreName.DAY_TASK][number]);
		dayTaskId = dayTaskCursorValue.id;

		if (typeof dayTask.status === 'number') {
			const status = await getStatusInternal(transaction, dayTask.status);
			if (status === null) {
				throw new Error(`Could not apply status ID ${dayTask.status} to day task ${dayTaskId} - No such status exists.`);
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

	if (typeof dayTaskId === 'undefined') {
		throw new Error(`Failed to update day task with day ID ${dayTask.day} and task ID ${dayTask.task} - No such day task exists.`);
	}

	await Promise.all(requests);

	return dayTaskId;
}
