import { h, type JSX } from 'preact';
import { useCallback } from 'preact/hooks';

import { classNames } from 'utils';

import { useSettableUnfinishedTaskIds } from 'database';

import { fireCommand } from 'registers/commands';
import { Command } from 'types/Command';

import { Button } from 'components/shared';

import { TaskList } from './TaskList';
import { TaskListLoader } from './TaskListLoader';

/**
 * Renders a {@linkcode TaskList} of all unfinished tasks.
 */
export function UnfinishedTaskList(): JSX.Element {
	const unfinishedTaskIdsState  = useSettableUnfinishedTaskIds();

	return <section
		class={classNames({
			'orange-twist__section': true,
		})}
	>
		<h2 class="orange-twist__title">Tasks</h2>

		<TaskListLoader
			taskIdsDataState={unfinishedTaskIdsState.getterState}
			setTaskIdOrder={unfinishedTaskIdsState.setData}
		/>

		<Button
			onClick={useCallback(() => fireCommand(Command.TASK_ADD_NEW), [])}
		>Add new task</Button>
	</section>;
}
