import { getIdbRequestPromise } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to remove an image.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param hash The hash of the image to delete.
 *
 * @returns a {@linkcode Promise} that resolves when the image has been removed.
 *
 * @throws Error if no image exists with the specified hash.
 */
export async function removeImageByHashInternal(
	transaction: IDBTransaction,
	hash: string,
): Promise<void> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);
	const hashIndex = imageOS.index(IndexName.IMAGE_HASH);

	const imageCursor = await getIdbRequestPromise(
		hashIndex.openCursor(hash)
	);

	if (!imageCursor) {
		// No cursor means the image doesn't exist
		throw new Error(`Cannot delete non-existent image with hash ${hash}`);
	}

	// Remove image
	await getIdbRequestPromise(imageCursor.delete());
}
