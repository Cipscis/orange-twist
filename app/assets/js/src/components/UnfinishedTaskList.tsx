import { h, type JSX } from 'preact';

import classNames from 'classnames';

import { TaskStatus } from 'types/TaskStatus';
import { Command } from 'types/Command';

import { useTaskInfo } from 'data/tasks';
import { fireCommand } from 'registers/commands';

import { TaskList } from './TaskList';

/**
 * Renders a {@linkcode TaskList} of all unfinished tasks in a disclosure.
 */
export function UnfinishedTasksList(): JSX.Element {
	const tasks = useTaskInfo();

	return <section
		class={classNames({
			'orange-twist__section': true,
		})}
	>
		<h2 class="orange-twist__title">Tasks</h2>
		{
			tasks && <>
				<TaskList
					taskIds={
						tasks
							.filter((task) => task.status !== TaskStatus.COMPLETED)
							.map(({ id }) => id)
					}
					className="orange-twist__task-list"
				/>

				<button
					type="button"
					class="button"
					onClick={() => fireCommand(Command.TASK_ADD_NEW)}
				>Add new task</button>
			</>
		}
	</section>;
}
