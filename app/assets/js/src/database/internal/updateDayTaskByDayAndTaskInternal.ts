import type { OptionalExcept } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getDayTaskForDayAndTaskInternal } from './getDayTaskForDayAndTaskInternal';
import { updateDayTaskInternal } from './updateDayTaskInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing day task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY_TASK} and {@linkcode ObjectStoreName.STATUS} object stores.
 * @param dayTask An object specifying which day task to update by the IDs of its day and task, and providing any values that should be updated.
 *
 * @returns a {@linkcode Promise} that resolves with the ID of the updated day task, once the update is complete.
 *
 * @throws Error if no day task exists with the specified day and task IDs.
 * @throws Error if no status exists with the specified status ID.
 */
export async function updateDayTaskByDayAndTaskInternal(
	transaction: IDBTransaction,
	dayTask: OptionalExcept<
		Omit<DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'id'>,
		'day' | 'task'
	>
): Promise<number> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const retrievedDayTask = await getDayTaskForDayAndTaskInternal(transaction, dayTask);

	if (!retrievedDayTask) {
		throw new Error(`Failed to update day task with day ID ${dayTask.day} and task ID ${dayTask.task} - No such day task exists.`);
	}

	return await updateDayTaskInternal(transaction, {
		...dayTask,
		id: retrievedDayTask.id,
	});
}
