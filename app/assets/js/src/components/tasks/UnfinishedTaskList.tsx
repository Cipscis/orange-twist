import { h, type JSX } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';

import { classNames, sortBySortIndex } from 'utils';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import {
	setAllTaskInfo,
	useAllTaskInfo,
	type TaskInfo,
} from 'data';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { Button } from '../shared';
import { TaskList } from './TaskList';

/**
 * Renders a {@linkcode TaskList} of all unfinished tasks in a disclosure.
 */
export function UnfinishedTaskList(): JSX.Element {
	const matcher = useCallback(
		({ status }: TaskInfo) => !CompletedTaskStatuses.has(status),
		[]
	);

	const matchingTaskInfo = useAllTaskInfo(matcher);
	const taskIdsToDisplay = useMemo(() => {
		const sortedTasks = sortBySortIndex(matchingTaskInfo);

		return sortedTasks.map(({ id }) => id);
	}, [
		matchingTaskInfo,
	]);

	const onReorder = useCallback((taskIds: readonly number[]) => {
		const entries = taskIds.map(
			(taskId, sortIndex) => [taskId, { sortIndex }] as const
		);
		setAllTaskInfo(entries);
		fireCommand(Command.DATA_SAVE);
	}, []);

	return <section
		class={classNames({
			'orange-twist__section': true,
		})}
	>
		<h2 class="orange-twist__title">Tasks</h2>

		<TaskList
			taskIds={taskIdsToDisplay}
			className="orange-twist__task-list"
			onReorder={onReorder}
		/>

		<Button
			onClick={useCallback(() => fireCommand(Command.TASK_ADD_NEW), [])}
		>Add new task</Button>
	</section>;
}
