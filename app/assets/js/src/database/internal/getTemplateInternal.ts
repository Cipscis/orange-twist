import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

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
	| DatabaseData[typeof ObjectStoreName.TEMPLATE][number]
	| null
> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	// TODO: Find a way to make this type safe
	const request = templateOS.get(templateId) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.TEMPLATE][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
