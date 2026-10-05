import { h, type JSX } from 'preact';

import { getTaskDetailUrl } from 'navigation';

import { IconName } from 'types/IconName';

import { IconButton } from 'components/shared';
import { TaskStatusPickerLegacy } from '../TaskStatusPicker';
import { SettableTaskName } from '../SettableTaskName';

interface TaskProps {
	taskId: number;
}

export const Task = (props: TaskProps): JSX.Element => {
	const { taskId } = props;

	return <div class="task">
		<TaskStatusPickerLegacy
			taskId={taskId}
		/>
		<IconButton
			href={getTaskDetailUrl(taskId)}
			title="View task"
			icon={IconName.FILE}
		/>
		<SettableTaskName taskId={taskId} />
	</div>;
};
