import { getIdbRequestPromise } from 'utils';

import { getDatabase } from './utils';
import type { DatabaseData } from './types';
import { ObjectStoreName } from './metadata';


/**
 * Retrieves all statuses.
 */
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
