import type { Template } from '../types';
import { ObjectStoreName } from '../metadata';
import { getTemplateByAliasInternal } from '../internal';
import { requestTransaction } from './requestTransaction';

/**
 * Loads data from a single template, specified by alias.
 */
export async function loadTemplateByAlias(alias: string): Promise<Template | null> {
	const transaction = await requestTransaction([ObjectStoreName.TEMPLATE], 'readonly');

	const template = await getTemplateByAliasInternal(transaction, alias);

	return template;
}
