import { h, type JSX } from 'preact';

import { useCurrentDayTaskForTask, useTask } from 'database';
import { TaskStatusPickerLoader } from './TaskStatusPickerLoader';

export interface TaskStatusPickerProps {
	taskId: number;
}

/**
 * Asynchronously retrieves information about a day task and passes it on to render a status picker for that day task once loaded.
 */
export function TaskStatusPicker(props: TaskStatusPickerProps): JSX.Element {
	const {
		taskId,
	} = props;

	const taskDataState = useTask(taskId);
	const currentDayTaskDataState = useCurrentDayTaskForTask(taskId);

	return <TaskStatusPickerLoader
		taskDataState={taskDataState}
		currentDayTaskDataState={currentDayTaskDataState}
	/>;
}
