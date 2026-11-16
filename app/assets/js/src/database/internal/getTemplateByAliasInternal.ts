import { getIdbRequestPromise } from 'utils';

import { IndexName, ObjectStoreName } from '../metadata';
import type { Template } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get the template with a specified alias.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 * @param templateAlias The alias of the template to retrieve.
 *
 * @returns A {@linkcode Promise} that resolves with the retrieved template object, or `null` if no template exists with the specified alias.
 */
export async function getTemplateByAliasInternal(
	transaction: IDBTransaction,
	templateAlias: string,
): Promise<
	| Template
	| null
> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);
	const templateAliasIndex = templateOS.index(IndexName.TEMPLATE_ALIAS);

	// This type assertion is safe because of other controls around what can be inserted into the database
	const request = templateAliasIndex.get(templateAlias) as IDBRequest<
		| Template
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
