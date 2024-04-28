import {
	useCallback,
} from 'preact/hooks';

import { useRegister } from 'utils';

import { templatesRegister } from '../templatesRegister';
import { type TemplateInfo } from 'data';

/**
 * Provides up to date information on all templates.
 */
export function useAllTemplateInfo(): readonly TemplateInfo[] {
	return useRegister(
		templatesRegister,
		useCallback(() => true, [])
	);
}
