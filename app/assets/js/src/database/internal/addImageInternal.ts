import {
	getIdbRequestPromise,
	type ExpandType,
	type WithOptional,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData, Image } from '../types';
import { getImageByHashInternal } from './getImageByHashInternal';


/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to insert an image to the image object store.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.IMAGE} object store.
 * @param image The image object to insert.
 *
 * @returns A {@linkcode Promise} that resolves with the new image's ID when it has been added.
 *
 * @throws Error if an image already exists with the same hash.
 */
export async function addImageInternal(
	transaction: IDBTransaction,
	image: ExpandType<
		WithOptional<Image, 'id'>
	>
): Promise<keyof DatabaseData[typeof ObjectStoreName.IMAGE]> {
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const existingImage = await getImageByHashInternal(transaction, image.hash);
	if (existingImage) {
		throw new Error(`Cannot add image - image already exists with hash ${image.hash}`);
	}

	const request = imageOS.add(image);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'number')) {
		throw new TypeError(`The key for an image should be a number. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}

