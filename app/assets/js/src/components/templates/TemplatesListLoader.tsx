import { h, type JSX } from 'preact';

import {
	AsyncDataStateType,
	type AsyncDataState,
} from 'utils/asyncData';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TemplatesListSync } from './TemplatesListSync';

export interface TemplateListLoaderProps {
	templateIdsDataState: AsyncDataState<readonly number[]>;
	setTemplateIdOrder?: (data: readonly number[]) => Promise<void>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving a list of template IDs. If those template IDs are loaded, uses them to render a list of those templates.
 */
export function TemplatesListLoader(props: TemplateListLoaderProps): JSX.Element {
	const {
		templateIdsDataState,
		setTemplateIdOrder,
	} = props;

	if (templateIdsDataState.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (templateIdsDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={templateIdsDataState.error.message}
		/>;
	}

	return <TemplatesListSync
		templateIds={templateIdsDataState.data}
		setTemplateIdOrder={setTemplateIdOrder}
	/>;
}
