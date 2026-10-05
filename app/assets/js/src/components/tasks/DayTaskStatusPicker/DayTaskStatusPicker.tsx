import { h, type JSX } from 'preact';

import { useSettableDayTask } from 'database';
import { DayTaskStatusPickerLoader } from './DayTaskStatusPickerLoader';

export interface DayTaskStatusPickerProps {
	dayTaskId: number;
}

/**
 * Asynchronously retrieves information about a day task and passes it on to render a status picker for that day task once loaded.
 */
export function DayTaskStatusPicker(props: DayTaskStatusPickerProps): JSX.Element {
	const {
		dayTaskId,
	} = props;

	const dayTaskDataState = useSettableDayTask(dayTaskId);

	return <DayTaskStatusPickerLoader
		dayTaskDataState={dayTaskDataState}
	/>;
}
