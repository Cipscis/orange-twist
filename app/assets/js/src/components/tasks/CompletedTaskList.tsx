import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import {
	getAllDayTaskInfo,
	type TaskInfo,
} from 'data';

import { Accordion } from 'components/shared';
import { TaskList } from './TaskList';

/**
 * Renders a list of all completed tasks inside a disclosure.
 */
export function CompletedTaskList(): JSX.Element | null {
	return <Accordion
		class="orange-twist__section"
		summary={
			<h2 class="orange-twist__title">Completed tasks</h2>
		}
	>
		<TaskList
			matcher={useCallback(
				({ status }: TaskInfo) => CompletedTaskStatuses.has(status),
				[]
			)}
			sorter={useCallback(
				(taskA: TaskInfo, taskB: TaskInfo): number => {
					// First, sort by last updated date, with more recent tasks first
					const dayTasksA = getAllDayTaskInfo({ taskId: taskA.id });
					const dayTasksB = getAllDayTaskInfo({ taskId: taskB.id });

					const lastUpdatedA = dayTasksA.at(-1)?.dayName ?? '0001-01-01';
					const lastUpdatedB = dayTasksB.at(-1)?.dayName ?? '0001-01-01';

					const comparison = lastUpdatedB.localeCompare(lastUpdatedA);

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
	</Accordion>;
}
