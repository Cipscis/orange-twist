import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Template } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get the template with a specified ID.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 * @param templateId The ID of the template to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved template object, or `null` if no template exists with the specified ID.
 */
export async function getTemplateInternal(
	transaction: IDBTransaction,
	templateId: number,
): Promise<
	| Template
	| null
> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = templateOS.get(templateId) as IDBRequest<
		| Template
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
