import { h, type JSX } from 'preact';
import {
	useCallback,
} from 'preact/hooks';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	setTaskInfo,
	deleteTask,
	useTaskInfo,
} from 'data';

import { TaskStatusComponent } from './TaskStatusComponent';
import {
	IconButton,
	InlineNote,
} from 'components/shared';

interface TaskProps {
	taskId: number;
	dayName?: string;
}

/**
 * Renders a single task, and allows for it to be edited.
 */
export function Task(props: TaskProps): JSX.Element | null {
	const { taskId, dayName } = props;
	const taskInfo = useTaskInfo(taskId);

	/**
	 * Save any changes to the name.
	 *
	 * If there is no task name, delete the task.
	 */
	const saveChanges = useCallback(() => {
		if (!taskInfo) {
			return;
		}

		if (taskInfo.name === '') {
			deleteTask(taskInfo.id);
		}
		fireCommand(Command.DATA_SAVE);
	}, [taskInfo]);

	/** Update the name. */
	const nameChangeHandler = useCallback((newName: string | null) => {
		if (!taskInfo) {
			return;
		}

		const name = newName ?? '';
		setTaskInfo(taskInfo.id, { name });
	}, [taskInfo]);

	if (!taskInfo) {
		return null;
	}

	return <div class="task">
		<TaskStatusComponent
			taskId={taskInfo.id}
			dayName={dayName}
		/>
		<IconButton
			href={`/task/?id=${taskInfo.id}`}
			title="View task"
			icon="📄"
		/>
		<InlineNote
			note={taskInfo.name}
			onNoteChange={nameChangeHandler}
			saveChanges={saveChanges}

			placeholder="Task name"
			editButtonTitle="Edit task name"

			class="task__name"
		/>
	</div>;
}
