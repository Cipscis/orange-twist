import { useEffect, useState } from 'preact/hooks';

import type { Task } from 'types/Task';

import type { AsyncDataState } from 'util/index';
import { useAsyncData } from 'util/index';

import { getTasks, loadTasksData } from '../tasksRegister';
import { onTasksChange } from '../listeners/onTasksChange';

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
		const controller = new AbortController();
		const { signal } = controller;

		const updateTasks = () => {
			const tasks = getTasks();
			setTasks(tasks);
		};

		onTasksChange(updateTasks, { signal });

		return () => {
			controller.abort();
		};
	}, []);

	return {
		data: tasks ?? data,
		isLoading,
		error,
	};
}
