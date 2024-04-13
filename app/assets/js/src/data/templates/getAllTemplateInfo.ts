import type { TemplateInfo } from './types';

import { templatesRegister } from './templatesRegister';

/**
 * Returns information on every template.
 */
export function getAllTemplateInfo(): Readonly<TemplateInfo>[] {
	return Array.from(templatesRegister.values());
}
