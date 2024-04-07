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
	// Initialise thisTemplateInfo based on the passed templateName
	const [thisTemplateInfo, setThisTemplateInfo] = useState(() => getAllTemplateInfo());

	/**
	 * Update the template info if and only if the relevant template has changed.
	 */
	const handleTemplateInfoUpdate = useCallback((changes: { key: string; }[]) => {
		setThisTemplateInfo(getAllTemplateInfo());
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

	return thisTemplateInfo;
}
