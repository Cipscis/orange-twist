import { getDatabase } from '../utils';
import { getImagesInternal } from '../internal';
import { ObjectStoreName } from '../metadata';

export async function getImagesV1(): Promise<(readonly [hash: string, image: Blob])[]> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');

	const imagesV1 = await getImagesInternal(transaction);

	return imagesV1.map(({ hash, file }) => [hash, file]);
}
