import { getIdbRequestPromise } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { Template } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get the template with a specified name.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 * @param templateName The name of the template to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved template object, or `null` if no template exists with the specified name.
 */
export async function getTemplateByNameInternal(
	transaction: IDBTransaction,
	templateName: string,
): Promise<
	| Template
	| null
> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);
	const templateNameIndex = templateOS.index(IndexName.TEMPLATE_NAME);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = templateNameIndex.get(templateName) as IDBRequest<
		| Template
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
