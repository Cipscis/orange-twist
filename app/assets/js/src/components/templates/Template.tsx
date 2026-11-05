import { h, type JSX } from 'preact';

import { useSettableTemplate } from 'database';

import { TemplateLoader } from './TemplateLoader';

interface TemplateProps {
	id: number;
}

/**
 * Renders a single template, and allows for it to be edited.
 */
export function Template(props: TemplateProps): JSX.Element | null {
	const { id } = props;

	const templateDataState = useSettableTemplate(id);

	return <TemplateLoader
		templateDataState={templateDataState}
	/>;
}
