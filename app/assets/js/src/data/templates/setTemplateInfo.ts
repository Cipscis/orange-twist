import type { TemplateInfo } from './types';

import { templatesRegister } from './templatesRegister';

const defaultTemplateInfo = {
	name: 'New template',
	template: '',
	sortIndex: -1,
} as const satisfies Omit<TemplateInfo, 'id'>;

/**
 * Updates the specified template with the provided information. If the template
 * has no information already, the blanks will be filled in with defaults.
 *
 * @param templateId The ID specifying the template to update.
 * @param templateInfo The new information to set of the specified template.
 */
export function setTemplateInfo(
	templateId: number,
	templateInfo: Partial<Omit<TemplateInfo, 'id'>>
): void {
	const existingTemplateInfo = templatesRegister.get(templateId);
	const newTemplateInfo: TemplateInfo = {
		id: templateId,

		name: templateInfo.name ?? existingTemplateInfo?.name ?? defaultTemplateInfo.name,
		template: templateInfo.template ?? existingTemplateInfo?.template ?? defaultTemplateInfo.template,
		sortIndex: templateInfo.sortIndex ?? existingTemplateInfo?.sortIndex ?? defaultTemplateInfo.sortIndex,
	};
	templatesRegister.set(templateId, newTemplateInfo);
}
