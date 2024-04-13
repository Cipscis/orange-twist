import {
	useCallback,
	useEffect,
	useState,
} from 'preact/hooks';

import { templatesRegister } from '../templatesRegister';
import {
	type TemplateInfo,
	getAllTemplateInfo,
} from 'data';

/**
 * Provides up to date information on all templates.
 */
export function useAllTemplateInfo(): TemplateInfo[] {
	const [allTemplateInfo, setAllTemplateInfo] = useState(() => getAllTemplateInfo());

	/**
	 * Update the template info any time a template changes.
	 */
	const handleTemplateInfoUpdate = useCallback(() => {
		setAllTemplateInfo(getAllTemplateInfo());
	}, []);

	// Listen for relevant changes on templatesRegister
	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		templatesRegister.addEventListener(
			'set',
			handleTemplateInfoUpdate,
			{ signal }
		);

		templatesRegister.addEventListener(
			'delete',
			handleTemplateInfoUpdate,
			{ signal }
		);

		return () => controller.abort();
	}, [handleTemplateInfoUpdate]);

	return allTemplateInfo;
}
