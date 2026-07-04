import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove an image.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param imageHash The hash of the image to delete;
 *
 * @returns a {@linkcode Promise} that resolves when the image has been removed.
 *
 * @throws Error if no image exists with the specified ID.
 */
export async function removeImageInternal(
	transaction: IDBTransaction,
	imageHash: string,
): Promise<void> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const imageCursor = await getIdbRequestPromise(
		imageOS.openCursor(imageHash)
	);

	if (!imageCursor) {
		// No cursor means the image doesn't exist
		throw new Error(`Cannot delete non-existent image with hash ${imageHash}`);
	}

	// Remove image
	await getIdbRequestPromise(imageCursor.delete());
}
