import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import { setAllTaskInfo, type TaskInfo } from 'data';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { TaskList } from './TaskList';

/**
 * Renders a list of all completed tasks inside a disclosure.
 */
export function CompletedTaskList(): JSX.Element | null {
	return <details class="orange-twist__section">
		<summary>
			<h2 class="orange-twist__title">Completed tasks</h2>
		</summary>

		<TaskList
			matcher={useCallback(
				({ status }: TaskInfo) => CompletedTaskStatuses.has(status),
				[]
			)}
			className="orange-twist__task-list"
			onReorder={(taskIds) => {
				const entries = taskIds.map(
					(taskId, sortIndex) => [taskId, { sortIndex }] as const
				);
				setAllTaskInfo(entries);
				fireCommand(Command.DATA_SAVE);
			}}
		/>
	</details>;
}
