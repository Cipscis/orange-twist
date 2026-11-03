import type { Template } from '../types';

import { ObjectStoreName } from '../metadata';
import { getAllTemplatesInternal } from '../internal';

import { requestTransaction } from './requestTransaction';

/**
 * Loads data from all templates.
 */
export async function loadAllTemplates(): Promise<Template[]> {
	const transaction = await requestTransaction([ObjectStoreName.TEMPLATE], 'readonly');

	const templates = await getAllTemplatesInternal(transaction);

	return templates;
}
