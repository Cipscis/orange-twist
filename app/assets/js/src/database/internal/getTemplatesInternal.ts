import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get all templates.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 *
 * @returns A {@linkcode Promise} that resolves to an array containing all templates, sorted according to their `sortIndex` property.
 */
export async function getTemplatesInternal(transaction: IDBTransaction): Promise<
	DatabaseData[typeof ObjectStoreName.TEMPLATE][number][]
> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = templateOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.TEMPLATE][number][]
	>;

	const templates = await getIdbRequestPromise(request);
	const sortedTemplates = sortBySortIndex(templates);

	return sortedTemplates;
}
