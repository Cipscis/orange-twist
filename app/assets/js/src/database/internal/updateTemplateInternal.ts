import {
	getIdbRequestPromise,
	getIterableCursor,
	type OptionalExcept,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing task.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 * @param template An object specifying which template to update by its ID, and providing any values that should be updated.
 *
 * @returns A {@linkcode Promise} that resolves with the tempalte's ID once it has been updated.
 *
 * @throws Error if no template exists with the specified ID.
 */
export async function updateTemplateInternal(
	transaction: IDBTransaction,
	template: OptionalExcept<
		DatabaseData[typeof ObjectStoreName.TEMPLATE][number],
		'id'
	>
): Promise<number> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	const requests: Promise<IDBValidKey>[] = [];

	for await (const templateCursor of getIterableCursor(templateOS, template.id)) {
		requests.push(
			getIdbRequestPromise(
				templateCursor.update({
					...templateCursor.value,
					...template,
				})
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update template ${template.id} - No such template exists`);
	}

	return template.id;
}
