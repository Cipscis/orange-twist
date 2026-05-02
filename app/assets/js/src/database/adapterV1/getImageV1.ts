import { getImageByHashInternal } from 'database/internal';
import { ObjectStoreName } from 'database/metadata';
import { getDatabase } from 'utils/indexedDB';

/**
 * Retrieve a schema v1 image `Blob` from the database v2.
 */
export async function getImageV1(hash: string): Promise<Blob | null> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE);
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const image = await getImageByHashInternal(imageOS, hash);

	return image?.file ?? null;
}
