import { getImagesInternal } from 'database/internal/getImagesInternal';
import { ObjectStoreName } from 'database/metadata';
import { getDatabase } from 'utils/indexedDB';

export async function getImagesV1(): Promise<(readonly [hash: string, image: Blob])[]> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const imagesV1 = await getImagesInternal(imageOS);

	return imagesV1.map(({ hash, file }) => [hash, file]);
}
