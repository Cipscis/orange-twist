import { h, type JSX } from 'preact';

import { IconName } from 'types/IconName';

import type { Task } from 'database';
import { getTaskDetailUrl } from 'navigation';

import { IconButton } from 'components/shared';
import { TaskStatusPicker } from '../../TaskStatusPicker';
import { SettableTaskNameSync } from '../../SettableTaskName';

export interface TaskSyncProps {
	task: Task;
	setTask: (data: Partial<Task>) => Promise<void>;
}

/**
 * Renders a brief view of a task. Allows its status to be changed, and its task's name to be updated. Also renders a link to the task's detail view.
 */
export function TaskSync(props: TaskSyncProps): JSX.Element {
	const {
		task,
		setTask,
	} = props;

	return <div class="task">
		<TaskStatusPicker
			taskId={task.id}
		/>
		<IconButton
			href={getTaskDetailUrl(task.id)}
			title="View task"
			icon={IconName.FILE}
		/>
		<SettableTaskNameSync
			task={task}
			setData={setTask}
		/>
	</div>;
}
