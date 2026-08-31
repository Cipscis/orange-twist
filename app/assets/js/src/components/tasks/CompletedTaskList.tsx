import { h, type JSX } from 'preact';
import type Preact from 'preact';
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'preact/hooks';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import {
	getAllDayTaskInfo,
	useAllTaskInfo,
	type TaskInfo,
} from 'data';

import { Accordion } from 'components/shared';
import { TaskList } from './TaskList';
import { sortElementsBySortIndex } from 'utils';

interface CompletedTaskListProps {
	open?: boolean;
}

/**
 * Renders a list of all completed tasks inside a disclosure.
 */
export function CompletedTaskList(props: CompletedTaskListProps): JSX.Element | null {
	const [listOpen, setListOpen] = useState(props.open ?? false);

	const onListToggle = useCallback((event: Preact.TargetedEvent<HTMLDetailsElement, Event>) => {
		setListOpen(event.currentTarget.open);
	}, []);

	const matcher = useCallback(
		({ status }: TaskInfo) => CompletedTaskStatuses.has(status),
		[]
	);

	const matchingTaskInfo = useAllTaskInfo(matcher);
	const sortedTaskIds = useMemo(() => {
		// Construct a proxy array with all information needed for sorting
		const sortableTaskInfo = matchingTaskInfo.map((taskInfo) => {
			const dayTasks = getAllDayTaskInfo({ taskId: taskInfo.id });
			const lastUpdated = dayTasks.at(-1)?.dayName ?? '0001-01-01';

			return [taskInfo, lastUpdated] as const;
		});

		// Sort the proxy array
		const sortedTasks = sortableTaskInfo.toSorted((
			[taskA, lastUpdatedA],
			[taskB, lastUpdatedB],
		) => {
			// First, sort by last updated date, with more recent tasks first
			const comparison = lastUpdatedB.localeCompare(lastUpdatedA);

			if (comparison !== 0) {
				return comparison;
			}

			// Then, sort by sort index
			return sortElementsBySortIndex(taskA, taskB);
		});

		// Then convert back to its original state once sorted
		return sortedTasks.map(([{ id }]) => id);
	}, [
		matchingTaskInfo,
	]);

	// Update list open state if prop changes
	useEffect(() => {
		setListOpen(props.open ?? false);
	}, [props.open]);

	return <Accordion
		class="orange-twist__section"
		summary={
			<h2 class="orange-twist__title">Completed tasks</h2>
		}
		onToggle={onListToggle}
		open={listOpen}
	>
		{listOpen &&
			<TaskList
				taskIds={sortedTaskIds}
				className="orange-twist__task-list"
			/>
		}
	</Accordion>;
}
