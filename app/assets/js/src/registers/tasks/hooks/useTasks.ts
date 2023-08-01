import { useLayoutEffect, useState } from 'preact/hooks';

import { Task } from '../../../types/Task.js';

import { getTasks } from '../tasksRegister.js';
import { onTasksChange, offTasksChange } from '../listeners/onTasksChange.js';

/**
 * A custom hoook that provides all tasks
 */
export function useTasks(): ReadonlyArray<Readonly<Task>> {
	const [tasks, setTasks] = useState<ReadonlyArray<Readonly<Task>>>(getTasks);

	// `useLayoutEffect` runs synchronously, so this approach works with
	// data being populated synchronously immediately after the initial render
	useLayoutEffect(() => {
		onTasksChange(setTasks);

		return (() => {
			offTasksChange(setTasks);
		});
	});

	return tasks;
}
