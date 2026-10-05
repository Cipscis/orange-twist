import { h, type JSX } from 'preact';

import { useDayTaskIdsForDay } from 'database';

import { DayTaskListLoader } from './DayTaskListLoader';

export interface DayTaskListForDayProps {
	dayId: number;
}

/**
 * Asynchronously retrieves the sorted IDs for all a day's day tasks, and passes them on to render a list of those day tasks once loaded.
 */
export function DayTaskListForDay(props: DayTaskListForDayProps): JSX.Element {
	const {
		dayId,
	} = props;

	const dayTaskIdsDataState = useDayTaskIdsForDay(dayId);

	return <DayTaskListLoader
		dayTaskIdsDataState={dayTaskIdsDataState}
	/>;
}
