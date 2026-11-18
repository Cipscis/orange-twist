import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove an image.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param id The ID of the image to delete.
 *
 * @returns a {@linkcode Promise} that resolves when the image has been removed.
 *
 * @throws Error if no image exists with the specified ID.
 */
export async function removeImageInternal(
	transaction: IDBTransaction,
	id: number,
): Promise<void> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const imageCursor = await getIdbRequestPromise(
		imageOS.openCursor(id)
	);

	if (!imageCursor) {
		// No cursor means the image doesn't exist
		throw new Error(`Cannot delete non-existent image with ID ${id}`);
	}

	// Remove image
	await getIdbRequestPromise(imageCursor.delete());
}
