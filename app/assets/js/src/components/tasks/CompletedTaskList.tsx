import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import {
	getAllDayTaskInfo,
	type TaskInfo,
} from 'data';

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
			sorter={useCallback(
				(taskA: TaskInfo, taskB: TaskInfo): number => {
					// First, sort by last updated date
					const dayTasksA = getAllDayTaskInfo({ taskId: taskA.id });
					const dayTasksB = getAllDayTaskInfo({ taskId: taskB.id });

					const lastUpdatedA = dayTasksA[dayTasksA.length - 1].dayName;
					const lastUpdatedB = dayTasksB[dayTasksB.length - 1].dayName;

					const comparison = lastUpdatedA.localeCompare(lastUpdatedB);

					if (comparison !== 0) {
						return comparison;
					}

					// Then, sort by sort index
					return taskA.sortIndex - taskB.sortIndex;
				},
				[]
			)}
			className="orange-twist__task-list"
		/>
	</details>;
}
