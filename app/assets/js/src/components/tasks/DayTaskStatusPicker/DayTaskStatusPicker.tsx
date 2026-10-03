import h, { type JSX } from 'preact';

import { useSettableDayTask } from 'database';
import { DayTaskStatusPickerLoader } from './DayTaskStatusPickerLoader';

export interface DayTaskStatusPickerProps {
	dayTaskId: number;
}

export function DayTaskStatusPicker(props: DayTaskStatusPickerProps): JSX.Element {
	const {
		dayTaskId,
	} = props;

	const dayTaskDataState = useSettableDayTask(dayTaskId);

	return <DayTaskStatusPickerLoader
		dayTaskDataState={dayTaskDataState}
	/>;
}
