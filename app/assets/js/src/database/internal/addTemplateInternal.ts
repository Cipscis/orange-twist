import { getIdbRequestPromise, type WithOptional } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

import { getTemplateInternal } from './getTemplateInternal';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to insert a new template to the template object store.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 * @param template The template object to insert. Any missing properties will be filled with sensible defaults.
 *
 * @returns A {@linkcode Proimse} that resolves with the template's ID when it has been added.
 *
 * @throws Error if a template already exists with the specified ID.
 * @throws TypeError if the database returns a non-number key after adding.
 */
export async function addTemplateInternal(
	transaction: IDBTransaction,
	template: WithOptional<DatabaseData[typeof ObjectStoreName.TEMPLATE][number], 'id'>
): Promise<DatabaseData[typeof ObjectStoreName.TEMPLATE][number]['id']> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	if (typeof template.id !== 'undefined') {
		const existingTemplate = await getTemplateInternal(transaction, template.id);
		if (existingTemplate) {
			throw new Error(`Cannot add template - template already exists with ID ${template.id}`);
		}
	}

	const request = templateOS.add(template);

	const result = await getIdbRequestPromise(request);
	if (!(typeof result === 'number')) {
		throw new TypeError(`The key for a template should be a number. Received ${JSON.stringify(result, null, '\t')}`);
	}

	return result;
}
