import type { TemplateInfo } from './types';

import { templatesRegister } from './templatesRegister';

/**
 * Returns information for the specified template, if any exists.
 *
 * @param templateName The name of the template to fetch information for.
 */
export function getTemplateInfo(templateName: string): Readonly<TemplateInfo> | null {
	return templatesRegister.get(templateName) ?? null;
}
