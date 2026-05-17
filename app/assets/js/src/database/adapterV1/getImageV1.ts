import { getDatabase } from '../utils';
import { getImageInternal } from '../internal';
import { ObjectStoreName } from '../metadata';

/**
 * Retrieve a schema v1 image `Blob` from the database v2.
 */
export async function getImageV1(hash: string): Promise<Blob | null> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');

	const image = await getImageInternal(transaction, hash);

	return image?.file ?? null;
}
