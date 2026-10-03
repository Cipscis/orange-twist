import { h, type JSX } from 'preact';

import { useAllStatuses } from 'database';

import type { TaskStatusPickerSyncProps } from './TaskStatusPickerSync';
import { TaskStatusPickerLoader } from './TaskStatusPickerLoader';

export type TaskStatusPickerProps = Omit<TaskStatusPickerSyncProps, 'statuses'>;

/**
 * Asynchronously retrieves all status information and passes it on to render a task status picker once loaded.
 *
 * Renders the status for a specific task, optionally for a specific day.
 *
 * Allows that status to be edited.
 */
export function TaskStatusPicker(props: TaskStatusPickerProps): JSX.Element | null {
	const statusAsyncDataState = useAllStatuses();

	return <TaskStatusPickerLoader
		{...props}
		statusAsyncDataState={statusAsyncDataState}
	/>;
}
