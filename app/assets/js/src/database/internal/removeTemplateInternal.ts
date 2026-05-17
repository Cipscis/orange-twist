import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove a day task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 * @param templateId The ID of the template to delete.
 *
 * @returns A {@linkcode Promise} that resolves when the template has been removed.
 *
 * @throws Error if no template exists with the specified ID.
 */
export async function removeTemplateInternal(
	transaction: IDBTransaction,
	templateId: number,
): Promise<void> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	const templateCursor = await getIdbRequestPromise(
		templateOS.openCursor(templateId)
	);

	if (!templateCursor) {
		// No cursor means the template doesn't exist
		throw new Error(`Cannot delete non-existent template with ID ${templateId}`);
	}

	// Remove template
	await getIdbRequestPromise(templateCursor.delete());
}
