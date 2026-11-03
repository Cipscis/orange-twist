import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils/asyncData';

import type { useSettableTemplate } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TemplateSync } from './TemplateSync';

export interface TemplateLoaderProps {
	templateDataState: ReturnType<typeof useSettableTemplate>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving template information. If template information is loaded, uses it to render that template.
 */
export function TemplateLoader(props: TemplateLoaderProps): JSX.Element {
	const {
		templateDataState,
	} = props;

	if (templateDataState.getterState.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (templateDataState.getterState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={templateDataState.getterState.error.message}
		/>;
	}

	return <TemplateSync
		template={templateDataState.getterState.data}
		setTemplate={templateDataState.setData}
	/>;
}
