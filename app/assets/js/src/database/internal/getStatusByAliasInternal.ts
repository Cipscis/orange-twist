import { getIdbRequestPromise } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a status by a specified alias.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.STATUS} object store.
 * @param alias The alias of the status to be retrieved.
 *
 * @returns A {@linkcode Promise} that resolves with the status that has the specified alias, or `null` if no such status exists.
 */
export async function getStatusByAliasInternal(
	transaction: IDBTransaction,
	alias: string,
): Promise<
	| DatabaseData[typeof ObjectStoreName.STATUS][number]
	| null
> {
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);
	const statusByAlias = statusOS.index(IndexName.STATUS_ALIAS);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = statusByAlias.get(alias) as IDBRequest<
			| DatabaseData[typeof ObjectStoreName.STATUS][number]
			| undefined
		>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
