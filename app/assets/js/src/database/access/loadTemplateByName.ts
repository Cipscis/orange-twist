import type { Template } from '../types';
import { ObjectStoreName } from '../metadata';
import { getTemplateByNameInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single template, specified by name.
 */
export async function loadTemplateByName(name: string): Promise<Template | null> {
	const transaction = await requestTransaction([ObjectStoreName.TEMPLATE], 'readonly');

	const template = await getTemplateByNameInternal(transaction, name);

	return template;
}
