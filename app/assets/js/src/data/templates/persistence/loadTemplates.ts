import { type PersistApi } from 'persist';
import { loadRegister } from 'utils';

import { templatesRegister } from '../templatesRegister';
import { updateOldTemplateInfo } from './updateOldTemplateInfo';

/**
 * Asynchronously loads any persisted templates info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when templates info has finished loading,
 * or rejects when templates info fails to load.
 */
export async function loadTemplates(
	persist: PersistApi,
	serialisedTemplatesInfo?: string
): Promise<void> {
	const options = serialisedTemplatesInfo
		? {
			data: serialisedTemplatesInfo,
		}
		: {
			persist,
			key: 'templates',
		};

	const isValidTemplateEntry = (entry: unknown): entry is [number, unknown] => (
		Array.isArray(entry) &&
		entry.length === 2 &&
		typeof entry[0] === 'number'
	);

	return loadRegister(
		templatesRegister,
		isValidTemplateEntry,
		updateOldTemplateInfo,
		options
	);
}
