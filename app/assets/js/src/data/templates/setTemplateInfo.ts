import type { TemplateInfo } from './types';

import { templatesRegister } from './templatesRegister';

const defaultTemplateInfo = {
	template: '',
} as const satisfies Omit<TemplateInfo, 'name'>;

/**
 * Updates the specified template with the provided information. If the template
 * has no information already, the blanks will be filled in with defaults.
 *
 * @param templateName The string specifying the name of the template to update.
 * @param templateInfo The new information to set of the specified template.
 */
export function setTemplateInfo(
	templateName: string,
	templateInfo: Partial<Omit<TemplateInfo, 'name'>>
): void {
	const existingTemplateInfo = templatesRegister.get(templateName);
	const newTemplateInfo: TemplateInfo = {
		name: templateName,

		template: templateInfo.template ?? existingTemplateInfo?.template ?? defaultTemplateInfo.template,
	};
	templatesRegister.set(templateName, newTemplateInfo);
}
