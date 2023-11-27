import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import classNames from 'classnames';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { type TaskInfo } from 'data';

import { TaskList } from './TaskList';

/**
 * Renders a {@linkcode TaskList} of all unfinished tasks in a disclosure.
 */
export function UnfinishedTasksList(): JSX.Element {
	return <section
		class={classNames({
			'orange-twist__section': true,
		})}
	>
		<h2 class="orange-twist__title">Tasks</h2>

		<TaskList
			matcher={useCallback(
				({ status }: TaskInfo) => !CompletedTaskStatuses.has(status),
				[]
			)}
			className="orange-twist__task-list"
		/>

		<button
			type="button"
			class="button"
			onClick={() => fireCommand(Command.TASK_ADD_NEW)}
		>Add new task</button>
	</section>;
}
