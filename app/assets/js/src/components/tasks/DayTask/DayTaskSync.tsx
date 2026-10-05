import { h, type JSX } from 'preact';

import { IconName } from 'types/IconName';

import type { DayTask } from 'database';
import { getTaskDetailUrl } from 'navigation';

import { IconButton } from 'components/shared';
import { DayTaskStatusPickerSync } from '../DayTaskStatusPicker';
import { SettableTaskName } from '../SettableTaskName';

export interface DayTaskSyncProps {
	dayTask: DayTask;
	setDayTask: (data: Partial<DayTask>) => Promise<void>;
}

/**
 * Renders a brief view of a day task. Allows its status to be changed, and its task's name to be updated. Also renders a link to the task's detail view.
 */
export function DayTaskSync(props: DayTaskSyncProps): JSX.Element {
	const {
		dayTask,
		setDayTask,
	} = props;

	return <div class="task">
		<DayTaskStatusPickerSync
			dayTask={dayTask}
			setDayTask={setDayTask}
		/>
		<IconButton
			href={getTaskDetailUrl(dayTask.task)}
			title="View task"
			icon={IconName.FILE}
		/>
		<SettableTaskName taskId={dayTask.task} />
	</div>;
}
