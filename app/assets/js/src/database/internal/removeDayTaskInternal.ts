import { getIdbRequestPromise } from 'utils';
import { ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove a day task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.DAY_TASK} object store.
 * @param dayTaskId The ID of the day task to delete.
 *
 * @returns A {@linkcode Promise} that resolves when the day task has been removed.
 *
 * @throws Error if no template exists with the specified ID.
 */
export async function removeDayTaskInternal(
	transaction: IDBTransaction,
	dayTaskId: number,
): Promise<void> {
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);

	const dayTaskCursor = await getIdbRequestPromise(dayTaskOS.openCursor(dayTaskId));

	if (!dayTaskCursor) {
		// No cursor means the day task doesn't exist
		throw new Error(`Cannot delete non-existent day task with ID ${JSON.stringify(dayTaskId)}`);
	}

	// Remove day task
	await getIdbRequestPromise(dayTaskCursor.delete());
}
