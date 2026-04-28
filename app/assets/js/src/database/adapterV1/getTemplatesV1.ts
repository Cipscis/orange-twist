import type { TemplateInfo } from 'data/templates';
import { getDatabase } from 'utils/indexedDB';
import { ObjectStoreName } from 'database/metadata';
import { getTemplatesInternal } from 'database/internal';

/**
 * Retrieve all schema v1 {@linkcode TemplateInfo} information from the database v2.
 */
export async function getTemplatesV1(): Promise<readonly [number, TemplateInfo][]> {
	const templatesV1: TemplateInfo[] = [];

	const db = await getDatabase();
	const transaction = db.transaction([
		ObjectStoreName.TEMPLATE,
	], 'readonly');

	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);

	const allTemplates = await getTemplatesInternal(templateOS);

	for (const template of allTemplates) {
		const templateV1: TemplateInfo = {
			id: template.id,
			name: template.name,
			sortIndex: template.sortIndex ?? 0,
			template: template.template,
		};

		templatesV1.push(templateV1);
	}

	return templatesV1.map((template) => [template.id, template]);
}
