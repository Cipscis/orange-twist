import { h, type JSX } from 'preact';

import { useCurrentDayTaskForTask, useDayTaskIdsForTask } from 'database';

import { DayTaskDetailListLoader } from './DayTaskDetailListLoader';

export interface DayTaskDetailListForTask {
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
	const currentDayTaskDataState = useCurrentDayTaskForTask(taskId);

	return <DayTaskDetailListLoader
		dayTaskIdsDataState={dayTaskIdsDataState}
		currentDayTaskDataState={currentDayTaskDataState}
	/>;
}
