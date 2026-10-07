import { h, type JSX } from 'preact';

import { AsyncDataStateType } from 'utils';

import type { useSettableDayTask } from 'database';

import {
	Loader,
	Notice,
	NoticeVariant,
} from 'components/shared';
import { DayTaskDetailSync, type DayTaskDetailSyncProps } from './DayTaskDetailSync';

export interface DayTaskDetailLoaderProps extends Omit<DayTaskDetailSyncProps, 'dayTask' | 'setDayTask'> {
	dayTaskDataState: ReturnType<typeof useSettableDayTask>;
}

/**
 * Handles the loading, error, and success states for asynchronously retrieving day task information. If day task information is loaded, uses it to render that day task in detail.
 */
export function DayTaskDetailLoader(props: DayTaskDetailLoaderProps): JSX.Element {
	const {
		dayTaskDataState,
	} = props;

	if (dayTaskDataState.stateOfGet.type === AsyncDataStateType.INITIAL) {
		return <Loader />;
	}

	if (dayTaskDataState.stateOfGet.type === AsyncDataStateType.ERROR) {
		return <Notice
			variant={NoticeVariant.ERROR}
			message={dayTaskDataState.stateOfGet.error.message}
		/>;
	}

	return <DayTaskDetailSync
		{...props}
		dayTask={dayTaskDataState.stateOfGet.data}
		setDayTask={dayTaskDataState.setData}
	/>;
}
