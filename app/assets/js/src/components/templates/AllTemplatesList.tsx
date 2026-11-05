import { h, type JSX } from 'preact';

import { useSettableAllTemplateIds } from 'database';

import { TemplatesListLoader } from './TemplatesListLoader';

/**
 * Renders a list of all templates, allowing them to be reordered and edited.
 */
export function AllTemplatesList(): JSX.Element {
	const allTemplateIdsDataState = useSettableAllTemplateIds();

	return <TemplatesListLoader
		templateIdsDataState={allTemplateIdsDataState.getterState}
		setTemplateIdOrder={allTemplateIdsDataState.setData}
	/>;
}
