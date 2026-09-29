import { h, type JSX } from 'preact';

import { IconName } from 'types/IconName';

import { useTaskInfo } from 'data';
import { getTaskDetailUrl } from 'navigation';

import { TaskStatusPicker } from './TaskStatusPicker';
import { IconButton } from 'components/shared';
import { SettableTaskName } from './Task/SettableTaskName';

interface DayTaskProps {
	taskId: number;
	dayName: string;
}

/**
 * Renders a single task, and allows for it to be edited.
 */
export function DayTask(props: DayTaskProps): JSX.Element | null {
	const { taskId, dayName } = props;
	const taskInfo = useTaskInfo(taskId);

	if (!taskInfo) {
		return null;
	}

	return <div class="task">
		<TaskStatusPicker
			taskId={taskInfo.id}
			dayName={dayName}
		/>
		<IconButton
			href={getTaskDetailUrl(taskInfo.id)}
			title="View task"
			icon={IconName.FILE}
		/>
		<SettableTaskName taskId={taskId} />
	</div>;
}
