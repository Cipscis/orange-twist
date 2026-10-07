import { h, type JSX } from 'preact';

import { useDayTaskIdsForTask } from 'database';

import { DayTaskDetailListLoader } from './DayTaskDetailListLoader';
import type { DayTaskDetailListSyncProps } from './DayTaskDetailListSync';

export interface DayTaskDetailListForTask extends Omit<DayTaskDetailListSyncProps, 'dayTaskIds'> {
	taskId: number;
}

/**
 * Asynchronously retrieves the sorted IDs for all a task's day tasks, and passes them on to render a list of those day tasks in detail once loaded.
 */
export function DayTaskDetailListForTask(props: DayTaskDetailListForTask): JSX.Element {
	const {
		taskId,
	} = props;

	const dayTaskIdsDataState = useDayTaskIdsForTask(taskId);

	// TODO: Determine which day task ID should be open by default
	const selectedDayTaskId = 1;

	return <DayTaskDetailListLoader
		dayTaskIdsDataState={dayTaskIdsDataState}
		selectedDayTaskId={selectedDayTaskId}
	/>;
}
