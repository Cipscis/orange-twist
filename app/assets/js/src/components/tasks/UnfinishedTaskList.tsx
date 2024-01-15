import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { classNames } from 'util/index';

import { CompletedTaskStatuses } from 'types/TaskStatus';
import { setAllTaskInfo, type TaskInfo } from 'data';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { Button } from '../shared';
import { TaskList } from './TaskList';

/**
 * Renders a {@linkcode TaskList} of all unfinished tasks in a disclosure.
 */
export function UnfinishedTaskList(): JSX.Element {
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
			onReorder={useCallback((taskIds: readonly number[]) => {
				const entries = taskIds.map(
					(taskId, sortIndex) => [taskId, { sortIndex }] as const
				);
				setAllTaskInfo(entries);
				fireCommand(Command.DATA_SAVE);
			}, [])}
		/>

		<Button
			onClick={useCallback(() => fireCommand(Command.TASK_ADD_NEW), [])}
		>Add new task</Button>
	</section>;
}
