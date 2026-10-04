import { h, type JSX } from 'preact';

import { IconName } from 'types/IconName';

import type { DayTask } from 'database';
import { getTaskDetailUrl } from 'navigation';

import { IconButton } from 'components/shared';
import { DayTaskStatusPicker } from '../DayTaskStatusPicker';
import { SettableTaskName } from '../SettableTaskName';

export interface DayTaskSyncProps {
	dayTask: DayTask;
}

export function DayTaskSync(props: DayTaskSyncProps): JSX.Element {
	const {
		dayTask,
	} = props;

	return <div class="task">
		<DayTaskStatusPicker
			dayTaskId={dayTask.id}
		/>
		<IconButton
			href={getTaskDetailUrl(dayTask.task)}
			title="View task"
			icon={IconName.FILE}
		/>
		<SettableTaskName taskId={dayTask.task} />
	</div>;
}
