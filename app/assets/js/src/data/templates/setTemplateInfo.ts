import type { TemplateInfo } from './types';

import { templatesRegister } from './templatesRegister';
import { getDefaultTemplateInfo } from './getDefaultTemplateInfo';

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
	if (existingTemplateInfo) {
		templatesRegister.set(templateId, {
			id: templateId,

			name: templateInfo.name ?? existingTemplateInfo?.name,
			template: templateInfo.template ?? existingTemplateInfo?.template,
			sortIndex: templateInfo.sortIndex ?? existingTemplateInfo?.sortIndex,
		});
	} else {
		const defaultTemplateInfo = getDefaultTemplateInfo(templateId);
		templatesRegister.set(templateId, {
			id: templateId,

			name: templateInfo.name ?? defaultTemplateInfo.name,
			template: templateInfo.template ?? defaultTemplateInfo.template,
			sortIndex: templateInfo.sortIndex ?? defaultTemplateInfo.sortIndex,
		});
	}
}
