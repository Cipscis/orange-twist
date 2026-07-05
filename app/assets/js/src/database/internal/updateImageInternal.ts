import { getIdbRequestPromise, getIterableCursor } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing image.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param image An object specifying which image to update by its month, also providing the file to use in the updated version.
 *
 * @throws Error if no image exists with the specified hash.
 */
export async function updateImageInternal(
	transaction: IDBTransaction,
	image: DatabaseData[typeof ObjectStoreName.IMAGE][string],
): Promise<void> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const requests: Promise<IDBValidKey>[] = [];
	for await (const imageCursor of getIterableCursor(imageOS, image.hash)) {
		requests.push(
			getIdbRequestPromise(
				imageCursor.update(image)
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update image ${image.hash} - No such image exists.`);
	}

	await Promise.all(requests);
}
