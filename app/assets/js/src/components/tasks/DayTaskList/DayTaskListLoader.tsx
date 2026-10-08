import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskListSync } from './DayTaskListSync';

export interface DayTaskListLoaderProps {
	dayTaskIdsDataState: AsyncDataState<readonly number[]>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving a list of day task IDs. If those day task IDs are loaded, uses them to render a list of those day tasks.
 */
export function DayTaskListLoader(props: DayTaskListLoaderProps): JSX.Element {
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

	return <DayTaskListSync
		dayTaskIds={dayTaskIdsDataState.data}
	/>;
}
