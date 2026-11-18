import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Image } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to retrieve an image by its specified id.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param id The id for the image to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves to the retrieved image, or `null` if no image exists with the specified id.
 */
export async function getImageInternal(
	transaction: IDBTransaction,
	id: number,
): Promise<
	| Image
	| null
> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = imageOS.get(id) as IDBRequest<
		| Image
		| undefined
	>;

	const image = await getIdbRequestPromise(request);

	return image ?? null;
}
