import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { SaveType, type Task } from 'database';

import { StatusPicker } from 'components/shared';
import * as ui from 'ui';
import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

export interface TaskStatusPickerSyncProps {
	task: Task;
	status: number;
	setStatus: (status: number) => Promise<void>;
}

/**
 * Renders a status picker for a day task.
 */
export function TaskStatusPickerSync(props: TaskStatusPickerSyncProps): JSX.Element {
	const {
		task,
		status,
		setStatus,
	} = props;

	/**
	 * Ask for confirmation, then remove this task.
	 */
	const deleteTask = useCallback(async () => {
		if (!await ui.confirm(`Are you sure you want to delete this task?`)) {
			return;
		}

		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK_DELETE,
			id: task.id,
		}]);
	}, [task]);

	return <StatusPicker
		status={status}

		onStatusSelect={setStatus}
		deleteButtonTitle="Delete task"
		onDelete={deleteTask}
	/>;
}
