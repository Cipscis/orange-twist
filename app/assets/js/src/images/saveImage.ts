// Type-only import to expose symbol in JSDoc
import type { getImage } from './getImage';

import { createImageHash } from './createImageHash';
import { adapterV1 } from 'database';

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

	await adapterV1.setImage(image, hash);

	return hash;
}
