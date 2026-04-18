import type { DatabaseData } from 'data/shared/types';
import {
	getDatabase,
	getIdbRequestPromise,
	ObjectStoreName,
} from 'utils/indexedDB';

export async function getStatuses(): Promise<DatabaseData['status']> {
	const db = await getDatabase();
	const transaction = db.transaction(ObjectStoreName.STATUS, 'readonly');
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);
	// TODO: Make a type safe way of doing this
	const statuses = await getIdbRequestPromise(statusOS.getAll() as IDBRequest<DatabaseData['status'][number][]>);

	return Object.fromEntries(
		statuses.map((status) => [status.id, status])
	);
}
