import type { Template } from '../types';
import { ObjectStoreName } from '../metadata';
import { getTemplateInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single template.
 */
export async function loadTemplate(id: number): Promise<Template | null> {
	const transaction = await requestTransaction([ObjectStoreName.TEMPLATE], 'readonly');

	const template = await getTemplateInternal(transaction, id);

	return template;
}
