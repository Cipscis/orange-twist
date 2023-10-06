import { h } from 'preact';
import {
	useCallback,
} from 'preact/hooks';

import classNames from 'classnames';

import { TaskStatus } from '../types/TaskStatus.js';

import { useTasks } from '../registers/tasks/index.js';
import { Command, fireCommand } from '../registers/commands/index.js';
import { reorderTasks } from '../registers/tasks/tasksRegister.js';

import { TaskList } from './TaskList.js';

/**
 * Renders a {@linkcode TaskList} of all unfinished tasks in a disclosure.
 */
export function UnfinishedTasksList() {
	const {
		data: tasks,
		isLoading: isTasksLoading,
		error: tasksError,
	} = useTasks();

	const onOpenTasksReorder = useCallback((taskIds: number[]) => {
		reorderTasks(taskIds);
		fireCommand(Command.DATA_SAVE);
	}, []);

	return <section
		class={classNames({
			'orange-twist__section': true,
			'orange-twist__section--loading': isTasksLoading,
		})}
		aria-busy={isTasksLoading || undefined}
	>
		<h2 class="orange-twist__title">Tasks</h2>

		{
			isTasksLoading &&
			<span class="orange-twist__loader" title="Tasks loading" />
		}
		{
			tasksError &&
			<span class="orange-twist__error">Tasks loading error: {tasksError}</span>
		}
		{
			tasks && <>
				<TaskList
					tasks={tasks.filter((task) => task.status !== TaskStatus.COMPLETED)}
					onReorder={onOpenTasksReorder}
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
