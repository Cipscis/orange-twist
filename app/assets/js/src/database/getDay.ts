import { getDatabase, getIdbRequestPromise } from 'utils/indexedDB';
import { ObjectStoreName } from './metadata';
import type { DatabaseData } from './types';

export async function getDay(id: number): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY][number]
	| null
> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	// TODO: Make a type safe way of doing this
	const day = await getIdbRequestPromise(
		dayOS.get(id) as IDBRequest<DatabaseData[typeof ObjectStoreName.DAY][number]>
	);

	return day ?? null;
}
