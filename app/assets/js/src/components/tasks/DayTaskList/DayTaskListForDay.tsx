import { h, type JSX } from 'preact';

import { useDayTaskIdsForDay } from 'database';

import { DayTaskListLoader } from './DayTaskListLoader';

export interface DayTaskListForDayProps {
	dayId: number;
}

export function DayTaskListForDay(props: DayTaskListForDayProps): JSX.Element {
	const {
		dayId,
	} = props;

	const dayTaskIdsDataState = useDayTaskIdsForDay(dayId);

	return <DayTaskListLoader
		dayTaskIdsDataState={dayTaskIdsDataState}
	/>;
}
