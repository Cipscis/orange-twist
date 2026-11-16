import type { Image } from '../types';
import { ObjectStoreName } from '../metadata';
import { getImageInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single image.
 */
export async function loadImage(hash: string): Promise<Image | null> {
	const transaction = await requestTransaction([ObjectStoreName.IMAGE], 'readonly');

	const image = await getImageInternal(transaction, hash);

	return image;
}
