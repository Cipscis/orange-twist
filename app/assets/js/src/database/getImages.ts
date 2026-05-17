import { getDatabase } from './utils';
import { ObjectStoreName } from './metadata';
import type { DatabaseData } from './types';
import { getImagesInternal } from './internal/getImagesInternal';

export async function getImages(): Promise<
	DatabaseData[typeof ObjectStoreName.IMAGE][string][]
> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');

	return await getImagesInternal(transaction);
}
