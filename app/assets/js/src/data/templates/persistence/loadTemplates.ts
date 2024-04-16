import { ls } from 'persist';
import { templatesRegister } from '../templatesRegister';
import { updateOldTemplateInfo } from './updateOldTemplateInfo';

/**
 * Asynchronously loads any persisted templates info, overwriting any data
 * currently in memory.
 *
 * @returns A Promise which resolves when templates info has finished loading,
 * or rejects when templates info fails to load.
 */
export async function loadTemplates(serialisedTemplatesInfo?: string): Promise<void> {
	const persistedTemplatesInfo = await (() => {
		if (typeof serialisedTemplatesInfo !== 'undefined') {
			return JSON.parse(serialisedTemplatesInfo);
		}

		return ls.get('templates');
	})();

	if (persistedTemplatesInfo === null) {
		templatesRegister.clear();
		return;
	}

	if (!(
		Array.isArray(persistedTemplatesInfo) &&
		persistedTemplatesInfo.every((el): el is [number, unknown] => (
			Array.isArray(el) &&
			el.length === 2 &&
			typeof el[0] === 'number'
		))
	)) {
		throw new Error(`Persisted templates data is invalid: ${serialisedTemplatesInfo}`);
	}

	const newTemplatesInfo = persistedTemplatesInfo.map(
		([templateName, templateInfo]) => [templateName, updateOldTemplateInfo(templateInfo)] as const
	);

	templatesRegister.clear();
	templatesRegister.set(newTemplatesInfo);
}
