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
	currentDayTaskDataState: AsyncDataState<DayTask | null>;
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
	} else if (currentDayTaskDataState.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={currentDayTaskDataState.error.message}
		/>;
	}

	return <DayTaskDetailListSync
		dayTaskIds={dayTaskIdsDataState.data}
		currentDayTaskId={currentDayTaskDataState.data?.id}
	/>;
}
