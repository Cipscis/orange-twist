import {
	useCallback,
	useEffect,
	useLayoutEffect,
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
 * @param templateId The name of the specified template.
 */
export function useTemplateInfo(templateId: number): TemplateInfo | null {
	// Initialise thisTemplateInfo based on the passed templateId
	const [thisTemplateInfo, setThisTemplateInfo] = useState(() => getTemplateInfo(templateId));

	const doneInitialRender = useRef(false);

	// Update thisTemplateInfo if templateId changes
	useEffect(() => {
		// Don't re-set the state during the initial render
		if (!doneInitialRender.current) {
			doneInitialRender.current = true;
			return;
		}

		setThisTemplateInfo(getTemplateInfo(templateId));
	}, [templateId]);

	/**
	 * Update the template info if and only if the relevant template has changed.
	 */
	const handleTemplateInfoUpdate = useCallback((changes: { key: number; }[]) => {
		const hasChanged = Boolean(changes.find(({ key }) => key === templateId));
		if (hasChanged) {
			const updatedTemplateInfo = getTemplateInfo(templateId);
			setThisTemplateInfo(updatedTemplateInfo);
		}
	}, [templateId]);

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

	return thisTemplateInfo;
}
