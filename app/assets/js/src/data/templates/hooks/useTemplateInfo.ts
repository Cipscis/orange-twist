import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import { templatesRegister } from '../templatesRegister';
import {
	type TemplateInfo,
	getTemplateInfo,
} from 'data';

/**
 * Provides up to date information on a single template.
 *
 * @param templateName The name of the specified template.
 */
export function useTemplateInfo(templateName: string): TemplateInfo | null {
	// Initialise thisTemplateInfo based on the passed templateName
	const [thisTemplateInfo, setThisTemplateInfo] = useState(() => getTemplateInfo(templateName));

	const doneInitialRender = useRef(false);

	// Update thisTemplateInfo if templateName changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisTemplateInfo(getTemplateInfo(templateName));
	}, [templateName]);

	/**
	 * Update the template info if and only if the relevant template has changed.
	 */
	const handleTemplateInfoUpdate = useCallback((changes: { key: string; }[]) => {
		const hasChanged = Boolean(changes.find(({ key }) => key === templateName));
		if (hasChanged) {
			setThisTemplateInfo(getTemplateInfo(templateName));
		}
	}, [templateName]);

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
