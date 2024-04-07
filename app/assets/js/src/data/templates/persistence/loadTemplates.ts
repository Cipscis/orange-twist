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
	// Until we use an asynchronous API to store this data, emulate
	// it by using the microtask queue.
	await new Promise<void>((resolve) => queueMicrotask(resolve));

	if (typeof serialisedTemplatesInfo === 'undefined') {
		serialisedTemplatesInfo = localStorage.getItem('templates') ?? undefined;
	}

	if (!serialisedTemplatesInfo) {
		templatesRegister.clear();
		return;
	}

	const persistedTemplatesInfo = JSON.parse(serialisedTemplatesInfo);

	if (!(
		Array.isArray(persistedTemplatesInfo) &&
		persistedTemplatesInfo.every((el): el is [string, unknown] => (
			Array.isArray(el) &&
			el.length === 2 &&
			typeof el[0] === 'string'
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
