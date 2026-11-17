import type { Image } from '../types';
import { ObjectStoreName } from '../metadata';
import { getImageByHashInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single image by its hash.
 */
export async function loadImageByHash(hash: string): Promise<Image | null> {
	const transaction = await requestTransaction([ObjectStoreName.IMAGE], 'readonly');

	const image = await getImageByHashInternal(transaction, hash);

	return image;
}
