import { h, type JSX } from 'preact';

import { useSettableDayTask } from 'database';

import { DayTaskDetailLoader } from './DayTaskDetailLoader';
import type { DayTaskDetailSyncProps } from './DayTaskDetailSync';

export interface DayTaskDetailProps extends Omit<DayTaskDetailSyncProps, 'dayTask' | 'setDayTask'> {
	dayTaskId: number;
}

/**
 * Asynchronously retrieves information about a day task and passes it on to render that day task in detail once loaded.
 */
export function DayTaskDetail(props: DayTaskDetailProps): JSX.Element {
	const {
		dayTaskId,
	} = props;

	const dayTaskDataState = useSettableDayTask(dayTaskId);

	return <DayTaskDetailLoader
		{...props}
		dayTaskDataState={dayTaskDataState}
	/>;
}
