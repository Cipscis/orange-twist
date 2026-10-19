import { h, type JSX } from 'preact';

import {
	AsyncDataStateType,
	type UseSettableLiveDataResult,
} from 'utils/asyncData';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskListSync } from './DayTaskListSync';

export interface DayTaskListLoaderProps {
	dayTaskIdsDataState: UseSettableLiveDataResult<readonly number[]>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving a list of day task IDs. If those day task IDs are loaded, uses them to render a list of those day tasks.
 */
export function DayTaskListLoader(props: DayTaskListLoaderProps): JSX.Element {
	const {
		dayTaskIdsDataState,
	} = props;

	if (dayTaskIdsDataState.getterState.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (dayTaskIdsDataState.getterState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayTaskIdsDataState.getterState.error.message}
		/>;
	}

	return <DayTaskListSync
		dayTaskIds={dayTaskIdsDataState.getterState.data}
		setDayTaskIdOrder={dayTaskIdsDataState.setData}
	/>;
}
