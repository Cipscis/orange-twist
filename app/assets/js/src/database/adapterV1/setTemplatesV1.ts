import type { TemplateInfo } from 'data/templates';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	addTemplateInternal,
	getTemplateInternal,
	updateTemplateInternal,
} from '../internal';

export async function setTemplatesV1(
	templates: readonly (readonly [number, TemplateInfo])[]
): Promise<void> {
	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TEMPLATE,
	], 'readwrite');

	const promises: Promise<unknown>[] = [];

	for (const [, templateInfo] of templates) {
		const existingTemplate = await getTemplateInternal(transaction, templateInfo.id);

		if (existingTemplate) {
			// Update existing template
			promises.push(
				updateTemplateInternal(transaction, templateInfo)
			);
			continue;
		}

		// Create a new template
		promises.push(
			addTemplateInternal(transaction, templateInfo)
		);
	}

	// TODO: Remove removed templates

	await Promise.all(promises);
}
