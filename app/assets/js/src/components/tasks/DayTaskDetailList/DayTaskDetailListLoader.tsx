import { h, type JSX } from 'preact';

import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncData';

import type { DayTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskDetailListSync } from './DayTaskDetailListSync';

export interface DayTaskDetailListLoaderProps {
	dayTaskIdsDataState: AsyncActionState<readonly number[]>;
	currentDayTaskDataState: AsyncActionState<DayTask>;
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
		dayTaskIdsDataState.type === AsyncActionStateType.INITIAL ||
		currentDayTaskDataState.type === AsyncActionStateType.INITIAL
	) {
		return <Loader />;
	}

	if (dayTaskIdsDataState.type === AsyncActionStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayTaskIdsDataState.error.message}
		/>;
	}

	const currentDayTaskId = currentDayTaskDataState.type === AsyncActionStateType.SUCCESS
		? currentDayTaskDataState.data.id
		: undefined;

	return <DayTaskDetailListSync
		dayTaskIds={dayTaskIdsDataState.data}
		currentDayTaskId={currentDayTaskId}
	/>;
}
