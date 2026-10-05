import { h, type JSX } from 'preact';

import { useSettableDayTask } from 'database';

import { DayTaskLoader } from './DayTaskLoader';

export interface DayTaskProps {
	dayTaskId: number;
}

/**
 * Asynchronously retrieves information about a day task and passes it on to render that day task once loaded.
 */

export function DayTask(props: DayTaskProps): JSX.Element {
	const {
		dayTaskId,
	} = props;

	const dayTaskDataState = useSettableDayTask(dayTaskId);

	return <DayTaskLoader
		dayTaskDataState={dayTaskDataState}
	/>;
}
