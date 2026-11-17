import { getIdbRequestPromise, getIterableCursor } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Image } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing image.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param image An object specifying which image to update by its ID, also providing the file to use in the updated version.
 *
 * @throws Error if no image exists with the specified ID.
 */
export async function updateImageInternal(
	transaction: IDBTransaction,
	image: Image,
): Promise<void> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const requests: Promise<IDBValidKey>[] = [];
	for await (const imageCursor of getIterableCursor(imageOS, image.id)) {
		requests.push(
			getIdbRequestPromise(
				imageCursor.update(image)
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update image ${image.id} - No such image exists.`);
	}

	await Promise.all(requests);
}
