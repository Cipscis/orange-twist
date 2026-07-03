import { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';
import { getIdbRequestPromise, type ExpandType } from 'utils';
import { getImageInternal } from './getImageInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to insert an image to the image object store.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param image The image object to insert.
 *
 * @returns A {@linkcode Promise} that resolves when the image has been added.
 *
 * @throws Error if an image already exists with the same hash.
 */
export async function addImageInternal(
	transaction: IDBTransaction,
	image: ExpandType<
		DatabaseData[typeof ObjectStoreName.IMAGE][string]
	>
): Promise<keyof DatabaseData[typeof ObjectStoreName.IMAGE]> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const existingImage = await getImageInternal(transaction, image.hash);
	if (existingImage) {
		throw new Error(`Cannot add image - image already exists with hash ${image.hash}`);
	}

	const request = imageOS.add(image);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'string')) {
		throw new TypeError(`The key for an image should be a string. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}
