import {
	useCallback,
} from 'preact/hooks';

import { useRegister } from 'utils';

import { templatesRegister } from '../templatesRegister';
import { type TemplateInfo } from 'data';

/**
 * Provides up to date information on a single template.
 *
 * @param templateId The name of the specified template.
 */
export function useTemplateInfo(templateId: number): TemplateInfo | null {
	return useRegister(
		templatesRegister,
		useCallback((key) => key === templateId, [templateId])
	)[0] ?? null;
}
