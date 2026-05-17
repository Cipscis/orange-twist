import { getIdbRequestPromise } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to retrieve an image by its specified truncated hash.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param hash The truncated hash for the image to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves to the retrieved image, or `null` if no image exists with the specified truncated hash.
 */
export async function getImageByHashInternal(
	transaction: IDBTransaction,
	hash: string,
): Promise<
	| DatabaseData[typeof ObjectStoreName.IMAGE][number]
	| null
> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	// TODO: Find a way to make this type-safe
	const request = imageOS.get(hash) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.IMAGE][number]
		| undefined
	>;

	const image = await getIdbRequestPromise(request);

	return image ?? null;
}
