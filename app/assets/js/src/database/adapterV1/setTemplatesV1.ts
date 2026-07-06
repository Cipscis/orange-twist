import type { TemplateInfo } from 'data/templates';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	addTemplateInternal,
	getTemplateInternal,
	getTemplatesInternal,
	removeTemplateInternal,
	updateTemplateInternal,
} from '../internal';

/**
 * Overwrites all template information in the database v2, using {@linkcode TemplateInfo} information from schema v1.
 */
export async function setTemplatesV1(
	templates: readonly (readonly [number, TemplateInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TEMPLATE,
	], 'readwrite');

	const promises: Promise<unknown>[] = [];

	const priorTemplateIds = new Set(
		(await getTemplatesInternal(transaction)).map(({ id }) => id)
	);
	const newTemplateIds = new Set<number>();

	for (const [, templateInfo] of templates) {
		const existingTemplate = await getTemplateInternal(transaction, templateInfo.id);

		if (existingTemplate) {
			// Update existing template
			promises.push(
				updateTemplateInternal(transaction, templateInfo)
					.then((templateId) => newTemplateIds.add(templateId))
			);
			continue;
		}

		// Create a new template
		promises.push(
			addTemplateInternal(transaction, templateInfo)
				.then((templateId) => newTemplateIds.add(templateId))
		);
	}

	// Wait for newTemplateIds to be populated
	await Promise.all(promises);

	// Remove removed templates
	const removedTemplateIds = priorTemplateIds.difference(newTemplateIds);

	for (const id of removedTemplateIds) {
		promises.push(
			removeTemplateInternal(transaction, id)
		);
	}

	await Promise.all(promises);
}
