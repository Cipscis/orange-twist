import { h, type JSX } from 'preact';

import { useAllStatuses } from 'database';

import type { TaskStatusPickerLegacySyncProps } from './TaskStatusPickerLegacySync';
import { TaskStatusPickerLegacyLoader } from './TaskStatusPickerLegacyLoader';

export type TaskStatusPickerLegacyProps = Omit<TaskStatusPickerLegacySyncProps, 'statuses'>;

/**
 * Asynchronously retrieves all status information and passes it on to render a task status picker once loaded.
 *
 * Renders the status for a specific task, optionally for a specific day.
 *
 * Allows that status to be edited.
 */
export function TaskStatusPickerLegacy(props: TaskStatusPickerLegacyProps): JSX.Element | null {
	const statusAsyncDataState = useAllStatuses();

	return <TaskStatusPickerLegacyLoader
		{...props}
		statusAsyncDataState={statusAsyncDataState}
	/>;
}
