import { h, type JSX } from 'preact';
import {
	useCallback,
	useMemo,
} from 'preact/hooks';

import classNames from 'classnames';

import { TaskStatus } from 'types/TaskStatus';
import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	useAllTaskInfo,
	type TaskInfo,
} from 'data';

import { TaskList } from './TaskList';

/**
 * Renders a {@linkcode TaskList} of all unfinished tasks in a disclosure.
 */
export function UnfinishedTasksList(): JSX.Element {
	const completedStatuses = useMemo<TaskStatus[]>(() => ([
		TaskStatus.COMPLETED,
		TaskStatus.WILL_NOT_DO,
	]), []);

	const tasks = useAllTaskInfo(useCallback(
		({ status }: TaskInfo) => !completedStatuses.includes(status),
		[completedStatuses]
	));

	return <section
		class={classNames({
			'orange-twist__section': true,
		})}
	>
		<h2 class="orange-twist__title">Tasks</h2>

		<TaskList
			taskIds={tasks.map(({ id }) => id)}
			className="orange-twist__task-list"
		/>

		<button
			type="button"
			class="button"
			onClick={() => fireCommand(Command.TASK_ADD_NEW)}
		>Add new task</button>
	</section>;
}
