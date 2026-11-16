import {
	getIdbRequestPromise,
	getIterableCursor,
	getTemplateAlias,
	type OptionalExcept,
} from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Template } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to update an existing template.
 *
 * @param transaction An {@linkcode IDBTransaction} with write permission and access to the {@linkcode ObjectStoreName.TEMPLATE} object store.
 * @param template An object specifying which template to update by its ID, and providing any values that should be updated.
 *
 * @returns A {@linkcode Promise} that resolves with the template's ID once it has been updated.
 *
 * @throws Error if no template exists with the specified ID.
 */
export async function updateTemplateInternal(
	transaction: IDBTransaction,
	template: OptionalExcept<
		Omit<Template, 'alias'>,
		'id'
	>
): Promise<number> {
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	const requests: Promise<IDBValidKey>[] = [];

	for await (const templateCursor of getIterableCursor(templateOS, template.id)) {
		// This type assertion is safe because of other controls around what can be inserted into the database
		const templateCursorValue = templateCursor.value as Template;

		// Ensure alias remains derived from name
		const templateToSave = structuredClone(template) as OptionalExcept<
			Template, 'id'
		>;
		if (
			'name' in templateToSave &&
			typeof templateToSave.name === 'string'
		) {
			templateToSave.alias = getTemplateAlias(templateToSave.name);
		}

		requests.push(
			getIdbRequestPromise(
				templateCursor.update({
					...templateCursorValue,
					...templateToSave,
				})
			)
		);
	}

	if (requests.length === 0) {
		throw new Error(`Failed to update template ${template.id} - No such template exists`);
	}

	return template.id;
}
