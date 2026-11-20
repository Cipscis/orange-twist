import type Preact from 'preact';
import {type JSX, h } from 'preact';

import { useAllTasks, type Task } from 'database';

import { TaskLookupLoader } from './TaskLookupLoader';

export interface TaskLookupProps extends Omit<
	Preact.SelectHTMLAttributes<HTMLSelectElement>,
	'onSelect'
> {
	/**
	 * A callback called when a task is selected.
	 */
	onSelect: (this: void, taskId: number) => void;

	/**
	 * An array filter predicate function used to show only a subset of tasks.
	 *
	 * @see {@linkcode Array.prototype.filter}
	 */
	filter?: (
		this: void,
		task: Task,
		index: number,
		array: readonly Task[],
	) => boolean;

	/**
	 * An array find predicate function used to pre-select a task if there is an ideal match.
	 */
	exactMatch?: (
		this: void,
		task: Task,
		index: number,
		array: readonly Task[],
	) => boolean;
}

/**
 * Asynchronously retrieves information about all tasks and passes it on to render a filterable menu showing a list of all tasks, providing a callback allowing one to be selected.
 */
export function TaskLookup(props: TaskLookupProps): JSX.Element {
	const allTasksDataState = useAllTasks();

	return <TaskLookupLoader
		{...props}
		tasksDataState={allTasksDataState}
	/>;
}
