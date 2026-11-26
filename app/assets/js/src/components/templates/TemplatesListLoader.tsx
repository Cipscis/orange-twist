import { h, type JSX } from 'preact';

import {
	AsyncActionStateType,
	type AsyncActionState,
} from 'utils/asyncData';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { TemplatesListSync } from './TemplatesListSync';

export interface TemplateListLoaderProps {
	templateIdsDataState: AsyncActionState<readonly number[]>;
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

	if (templateIdsDataState.type === AsyncActionStateType.INITIAL) {
		return <Loader />;
	}

	if (templateIdsDataState.type === AsyncActionStateType.ERROR) {
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
