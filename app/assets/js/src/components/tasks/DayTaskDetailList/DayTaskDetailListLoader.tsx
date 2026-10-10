import { h, type JSX } from 'preact';

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import type { DayTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskDetailListSync } from './DayTaskDetailListSync';

export interface DayTaskDetailListLoaderProps {
	dayTaskIdsDataState: AsyncDataState<readonly number[]>;
	currentDayTaskDataState: AsyncDataState<DayTask>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving a list of day task IDs. If those day task IDs are loaded, uses them to render a list of those day tasks in detail.
 */
export function DayTaskDetailListLoader(props: DayTaskDetailListLoaderProps): JSX.Element {
	const {
		dayTaskIdsDataState,
		currentDayTaskDataState,
	} = props;

	if (
		dayTaskIdsDataState.type === AsyncDataStateType.INITIAL ||
		currentDayTaskDataState.type === AsyncDataStateType.INITIAL
	) {
		return <Loader />;
	}

	if (dayTaskIdsDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayTaskIdsDataState.error.message}
		/>;
	}

	const currentDayTaskId = currentDayTaskDataState.type === AsyncDataStateType.SUCCESS
		? currentDayTaskDataState.data.id
		: undefined;

	return <DayTaskDetailListSync
		dayTaskIds={dayTaskIdsDataState.data}
		currentDayTaskId={currentDayTaskId}
	/>;
}
