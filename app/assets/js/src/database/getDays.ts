import { getDatabase } from './utils';
import { ObjectStoreName } from './metadata';
import type { DatabaseData } from './types';
import { getDaysInternal } from './internal';

export async function getDays(): Promise<DatabaseData[typeof ObjectStoreName.DAY][number][]> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');

	return getDaysInternal(transaction);
}
