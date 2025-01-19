import { h, type JSX } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import {
	getAllDayTaskInfo,
	type TaskInfo,
} from 'data';

import { Accordion } from 'components/shared';
import { TaskList } from './TaskList';

interface CompletedTaskListProps {
	open?: boolean;
}

/**
 * Renders a list of all completed tasks inside a disclosure.
 */
export function CompletedTaskList(props: CompletedTaskListProps): JSX.Element | null {
	const [listOpen, setListOpen] = useState(props.open);
	const onListToggle = useCallback((event: JSX.TargetedEvent<HTMLDetailsElement, Event>) => {
		setListOpen(event.currentTarget.open);
	}, []);

	const matcher = useCallback(
		({ status }: TaskInfo) => CompletedTaskStatuses.has(status),
		[]
	);

	const sorter = useCallback(
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
	);

	return <Accordion
		class="orange-twist__section"
		summary={
			<h2 class="orange-twist__title">Completed tasks</h2>
		}
		onToggle={onListToggle}
	>
		{listOpen &&
			<TaskList
				matcher={matcher}
				sorter={sorter}
				className="orange-twist__task-list"
			/>
		}
	</Accordion>;
}
