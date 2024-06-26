import { h, type JSX } from 'preact';
import { useMemo } from 'preact/hooks';

import { classNames } from 'utils';

import { useAllTaskInfo, type TaskInfo } from 'data';

import { DragList } from 'components/shared';
import { Task } from './Task';

interface TaskListProps {
	/**
	 * Either an array of task IDs, or a function that determines
	 * whether or not a task should be displayed.
	 */
	matcher: readonly number[] | ((task: TaskInfo) => boolean);
	/**
	 * A function to be used to determine the sorting order of tasks.
	 * If ommitted, tasks will be sorted by their `sortIndex`.
	 *
	 * Ignored if `matcher` is an array of task IDs.
	 */
	sorter?: ((taskA: TaskInfo, TaskB: TaskInfo) => number);
	dayName?: string;
	className?: string;

	onReorder?: (taskIds: readonly number[]) => void;
}

/**
 * Renders a list of specified tasks, which can be
 * reordered via drag & drop.
 */
export function TaskList(
	props: TaskListProps,
): JSX.Element {
	const {
		matcher,
		sorter,
		dayName,
		className,

		onReorder,
	} = props;

	const tasksInfoUnsorted = useAllTaskInfo(matcher);

	/**
	 * Instructions on how tasks should be sorted, if necessary.
	 */
	const sortTasks = useMemo(() => {
		// If passed an array of task IDs, sort based on that array
		if (Array.isArray(matcher)) {
			return (
				{ id: idA }: TaskInfo,
				{ id: idB }: TaskInfo
			) => {
				return matcher.indexOf(idA) - matcher.indexOf(idB);
			};
		}

		// If there is a sorter function, use that
		if (sorter) {
			return sorter;
		}

		// Otherwise, sort by sortIndex
		return (
			{ sortIndex: indexA }: TaskInfo,
			{ sortIndex: indexB }: TaskInfo
		) => {
			return indexA - indexB;
		};
	}, [matcher, sorter]);

	// Sort task info if necessary
	const tasksInfo = useMemo(() => {
		if (sortTasks) {
			return tasksInfoUnsorted.toSorted(sortTasks);
		}

		return tasksInfoUnsorted;
	}, [tasksInfoUnsorted, sortTasks]);

	return <DragList
		class={classNames('task-list', className)}
		onReorder={onReorder}
	>
		{tasksInfo.map((taskInfo, i) => {
			return <div
				key={taskInfo.id}
				data-drag-list-key={taskInfo.id}
				class="task-list__item"
			>
				<Task
					taskId={taskInfo.id}
					dayName={dayName}
				/>
			</div>;
		})}
	</DragList>;
}
