import { getDatabase } from 'utils/indexedDB';
import { ObjectStoreName } from './metadata';
import type { DatabaseData } from './types';
import { getImagesInternal } from './internal/getImagesInternal';

export async function getImages(): Promise<
	DatabaseData[typeof ObjectStoreName.IMAGE][number][]
> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	return await getImagesInternal(imageOS);
}
