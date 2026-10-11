import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import {
	SaveType,
	useSettableStatusForTask,
	useTask,
} from 'database';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import * as ui from 'ui';

import { TaskStatusPickerLoader } from './TaskStatusPickerLoader';

export interface TaskStatusPickerProps {
	taskId: number;
}

/**
 * Asynchronously retrieves information about a task and passes it on to render a status picker for that task once loaded.
 */
export function TaskStatusPicker(props: TaskStatusPickerProps): JSX.Element {
	const {
		taskId,
	} = props;

	const taskDataState = useTask(taskId);
	const taskStatusDataState = useSettableStatusForTask(taskId);

	/**
	 * Ask for confirmation, then remove this task.
	 */
	const deleteTask = useCallback(async () => {
		if (!await ui.confirm(`Are you sure you want to delete this task?`)) {
			return;
		}

		fireCommand(Command.DATA_SAVE, [{
			type: SaveType.TASK_DELETE,
			id: taskId,
		}]);
	}, [taskId]);

	return <TaskStatusPickerLoader
		taskDataState={taskDataState}
		taskStatusDataState={taskStatusDataState}
		deleteTask={deleteTask}
	/>;
}
