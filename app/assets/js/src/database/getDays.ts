import { getDatabase } from 'utils/indexedDB';

import { ObjectStoreName } from './metadata';
import type { DatabaseData } from './types';
import { getDaysInternal } from './internal';

export async function getDays(): Promise<DatabaseData[typeof ObjectStoreName.DAY][number][]> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	return getDaysInternal(dayOS);
}
