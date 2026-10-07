import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskDetailListSync, type DayTaskDetailListSyncProps } from './DayTaskDetailListSync';

export interface DayTaskDetailListLoaderProps extends Omit<DayTaskDetailListSyncProps, 'dayTaskIds'> {
	dayTaskIdsDataState: AsyncDataState<readonly number[]>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving a list of day task IDs. If those day task IDs are loaded, uses them to render a list of those day tasks in detail.
 */
export function DayTaskDetailListLoader(props: DayTaskDetailListLoaderProps): JSX.Element {
	const {
		dayTaskIdsDataState,
	} = props;

	if (dayTaskIdsDataState.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (dayTaskIdsDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayTaskIdsDataState.error.message}
		/>;
	}

	return <DayTaskDetailListSync
		{...props}
		dayTaskIds={dayTaskIdsDataState.data}
	/>;
}
