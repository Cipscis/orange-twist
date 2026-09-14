import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Image } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all iamges.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 *
 * @returns A {@linkcode Promise} that resolves with an array containing all images.
 */
export async function getImagesInternal(transaction: IDBTransaction): Promise<
	Image[]
> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = imageOS.getAll() as IDBRequest<
		Image[]
	>;

	const result = await getIdbRequestPromise(request);

	return result;
}
