import { useEffect, useState } from 'preact/hooks';

import { Task } from '../../../types/Task.js';

import { AsyncDataState, useAsyncData } from '../../../util/index.js';

import { getTasks, loadTasksData } from '../tasksRegister.js';
import { onTasksChange, offTasksChange } from '../listeners/onTasksChange.js';

export function useTasks(): AsyncDataState<ReadonlyArray<Readonly<Task>>> {
	const {
		data,
		isLoading,
		error,
	} = useAsyncData(loadTasksData);

	// Try to initialise with existing data
	const [tasks, setTasks] = useState<ReadonlyArray<Task> | null>(() => {
		if (data) {
			return data;
		}

		const tasks = getTasks();
		if (tasks.length > 0) {
			return tasks;
		}

		return null;
	});

	// When tasks are updated, reflect that
	useEffect(() => {
		const updateTasks = () => {
			const tasks = getTasks();
			setTasks(tasks);
		};

		onTasksChange(updateTasks);

		return () => {
			offTasksChange(updateTasks);
		};
	}, []);

	return {
		data: tasks ?? data,
		isLoading,
		error,
	};
}
