import { h, type JSX } from 'preact';

import { StatusPicker } from 'components/shared';

export interface TaskStatusPickerSyncProps {
	status: number;
	setStatus: (status: number) => Promise<void>;
	deleteTask: () => Promise<void>;
}

/**
 * Renders a status picker for a task.
 */
export function TaskStatusPickerSync(props: TaskStatusPickerSyncProps): JSX.Element {
	const {
		status,
		setStatus,
		deleteTask,
	} = props;

	return <StatusPicker
		status={status}

		onStatusSelect={setStatus}
		deleteButtonTitle="Delete task"
		onDelete={deleteTask}
	/>;
}
