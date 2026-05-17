// Type-only import to expose symbol in JSDoc
import type { getImage } from './getImage';

import { createImageHash } from './createImageHash';

import { ObjectStoreName } from 'database/metadata';
import { doDatabaseTransaction, getDatabaseVersion } from 'database/utils';

/**
 * Persist an image in IndexedDB, so it can be retrieved later.
 *
 * @param image - The image to be saved.
 *
 * @returns A key that can be used to retrieve the image later.
 * This key is a truncated SHA-256 hash of the image.
 *
 * @see {@linkcode getImage} For how to retrieve a stored image.
 */
export async function saveImage(image: Blob): Promise<string> {
	const hash = await createImageHash(image);

	// TODO: Get rid of this database v1 handling
	const dbVersion = await getDatabaseVersion();
	if (dbVersion === 1 || dbVersion === null) {
		await doDatabaseTransaction(
			'readwrite',
			[ObjectStoreName.IMAGES],
			([store]) => store.put(image, hash)
		);
		return hash;
	}

	// TODO: Implement v2 handling
	throw new Error('Saving image not implemented');

	return hash;
}
