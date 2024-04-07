import type { TemplateInfo } from './types';

import { templatesRegister } from './templatesRegister';

/**
 * Returns information for the specified template, if any exists.
 *
 * @param id The ID of the template to fetch information for.
 */
export function getTemplateInfo(id: number): Readonly<TemplateInfo> | null {
	return templatesRegister.get(id) ?? null;
}
