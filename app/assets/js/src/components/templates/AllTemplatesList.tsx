import { h, type JSX } from 'preact';

import { sortBySortIndex } from 'utils';

import { useAllTemplateInfo } from 'data';

import { TemplatesList } from './TemplatesList';

/**
 * Renders a list of all templates, allowing them to be reordered and edited.
 */
export function AllTemplatesList(): JSX.Element {
	const allTemplateInfoUnsorted = useAllTemplateInfo();
	const allTemplateInfo = sortBySortIndex(allTemplateInfoUnsorted);

	return <TemplatesList templates={allTemplateInfo} />;
}
