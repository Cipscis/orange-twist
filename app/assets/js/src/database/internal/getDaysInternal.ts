import { getIdbRequestPromise } from 'utils/indexedDB';

import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';

/**
 * **Important** Intended for internal use within the database API only.
 *
 * Returns all days, when provided with the days {@linkcode IDBObjectStore} from within an existing transaction.
 */
export function getDaysInternal(daysOS: IDBObjectStore): Promise<
	DatabaseData[typeof ObjectStoreName.DAY][number][]
> {
	// TODO: Find a type-safe way of doing this
	const request = daysOS.getAll() as IDBRequest<DatabaseData[typeof ObjectStoreName.DAY][number][]>;

	return getIdbRequestPromise(request);
}
