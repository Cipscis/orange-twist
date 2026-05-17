import { getDatabase } from './utils';
import { ObjectStoreName } from './metadata';
import type { DatabaseData } from './types';
import { getImageInternal } from './internal';

export async function getImage(hash: string): Promise<
	| DatabaseData[typeof ObjectStoreName.IMAGE][number]
	| null
> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.IMAGE, 'readonly');

	return await getImageInternal(transaction, hash);
}
