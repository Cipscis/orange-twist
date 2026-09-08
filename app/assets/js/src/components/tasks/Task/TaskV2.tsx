import { h, type JSX } from 'preact';

import { getTaskDetailUrl } from 'navigation';

import { IconButton } from 'components/shared';
import { SettableTaskName } from './SettableTaskName';

interface TaskV2Props {
	taskId: number;
}

export const TaskV2 = (props: TaskV2Props): JSX.Element => {
	const {
		taskId,
	} = props;

	return <div class="task">
		<IconButton
			href={getTaskDetailUrl(taskId)}
			title="View task"
			icon="📄"
		/>
		<SettableTaskName taskId={taskId} />
	</div>;
};
