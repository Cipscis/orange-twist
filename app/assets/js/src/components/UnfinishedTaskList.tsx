import { h } from 'preact';
import {
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'preact/hooks';

import classNames from 'classnames';

import { TaskStatus } from '../types/TaskStatus.js';

import { addNewTask, useTasks } from '../registers/tasks/index.js';
import { Command, fireCommand, useCommand } from '../registers/commands/index.js';
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

	const [newTasksCreated, setNewTasksCreated] = useState(0);

	// After the initial load, focus on the last task each time a new one is created.
	const unfinishedTasksListRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (newTasksCreated  === 0) {
			return;
		}

		const taskListWrapper = unfinishedTasksListRef.current;

		if (!taskListWrapper) {
			return;
		}

		// Find new task and put it in edit mode, then scroll to it

		// TODO: Is this the best way to find the right element?
		const taskEditButtons = Array.from(taskListWrapper.querySelectorAll<HTMLElement>('.js-task__name-edit') ?? []);
		const lastTaskEditButton = taskEditButtons.at(-1);

		lastTaskEditButton?.click();
		lastTaskEditButton?.scrollIntoView({
			block: 'center',
			behavior: 'smooth',
		});
	}, [newTasksCreated]);

	// TODO: Move this to `OrangeTwist` and find another way to hook this up
	/**
	 * Create a new task not attached to any particular day,
	 * and then scroll to it immediately.
	 *
	 * @param [dayName] If this parameter specified, no task will be created.
	 */
	const addNewTaskWithoutDayName = useCallback((dayName?: string) => {
		if (dayName) {
			return;
		}

		addNewTask();
		setNewTasksCreated((oldValue) => oldValue + 1);
	}, []);
	useCommand(Command.TASK_ADD_NEW, addNewTaskWithoutDayName);

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
		ref={unfinishedTasksListRef}
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
					onClick={() => addNewTaskWithoutDayName()}
				>Add new task</button>
			</>
		}
	</section>;
}
