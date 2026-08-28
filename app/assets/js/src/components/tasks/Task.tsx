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
import { getTaskDetailUrl } from 'navigation';

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
	 * Update the name, and save any changes to it.
	 *
	 * If there is no task name, delete the task.
	 */
	const nameChangeHandler = useCallback((newName: string | null) => {
		if (!taskInfo) {
			return;
		}

		const name = newName ?? '';
		setTaskInfo(taskInfo.id, { name });

		if (newName === '') {
			deleteTask(taskInfo.id);
		}
		fireCommand(Command.DATA_SAVE);
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
			href={getTaskDetailUrl(taskInfo.id)}
			title="View task"
			icon="📄"
		/>
		<InlineNote
			note={taskInfo.name}
			onNoteChange={nameChangeHandler}

			placeholder="Task name"
			editButtonTitle="Edit task name"

			class="task__name"
		/>
	</div>;
}
