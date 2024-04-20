import {
	useCallback,
	useLayoutEffect,
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
	// Use a layout effect so it doesn't wait for rendering,
	// otherwise data could finish loading after we've read
	// it but before we start listening for changes.
	useLayoutEffect(() => {
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
