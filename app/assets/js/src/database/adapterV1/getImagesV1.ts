import { getDatabase } from '../utils';
import { getImagesInternal } from '../internal';
import { ObjectStoreName } from '../metadata';

/**
 * Retrieve all schema v1 image information from the database v2.
 */
export async function getImagesV1(): Promise<(readonly [hash: string, image: Blob])[]> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');

	const imagesV1 = await getImagesInternal(transaction);

	return imagesV1.map(({ hash, file }) => [hash, file]);
}
