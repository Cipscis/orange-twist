// Type-only import to expose symbol in JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { getImage } from './getImage';

import { ObjectStoreName, doDatabaseTransaction } from 'utils';
import { sha256 } from './sha256';

/**
 * Persist an image in IndexedDB, so it can be retrieved later.
 *
 * @param image - The image to be saved.
 *
 * @returns A key that can be used to retrieve the image later.
 *
 * @see {@linkcode getImage} For how to retrieve a stored image.
 */
export async function saveImage(image: Blob): Promise<string> {
	const hash = await sha256(image);
	await doDatabaseTransaction(
		'readwrite',
		ObjectStoreName.IMAGES,
		(store) => store.put(image, hash)
	);
	return hash;
}
