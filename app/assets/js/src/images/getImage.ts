// Type-only import to expose symbol in JSDoc
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import type { saveImage } from './saveImage';

import { ObjectStoreName, doDatabaseTransaction } from 'utils';

/**
 * Retrieve a Blob from the image object store.
 *
 * @param key - The key where the image is stored, as generated by {@linkcode saveImage}
 *
 * @returns A Promise that resolves to a Blob containing image data,
 * if an image existed. Otherwise it resolves to null.
 *
 * @see {@linkcode saveImage} For how to save an image for retrieval.
 */
export async function getImage(key: string): Promise<Blob | null> {
	const image = await doDatabaseTransaction(
		'readonly',
		ObjectStoreName.IMAGES,
		(store) => store.get(key)
	);

	if (image instanceof Blob) {
		return image;
	}
	return null;
}
