import { isArrayOf } from '@cipscis/ts-toolbox';

import { Task, isTask } from '../../../types/Task.js';

const isValidTasksData = isArrayOf(
	(el: unknown): el is [number, Task] => {
		if (!Array.isArray(el)) {
			return false;
		}

		if (!(el.length === 2)) {
			return false;
		}

		if (!(typeof el[0] === 'number')) {
			return false;
		}

		if (!(isTask(el[1]))) {
			return false;
		}

		return true;
	}
);

/**
 * Load data for the tasks register from where it was persisted.
 */
export async function loadTasks(): Promise<Iterable<[number, Task]> | null> {
	try {
		const serialisedTasks = localStorage.getItem('tasks');
		if (serialisedTasks === null) {
			return null;
		}

		const persistedTasks = JSON.parse(serialisedTasks) as unknown;

		if (!isValidTasksData(persistedTasks)) {
			// TODO: Handle error
			console.log('invalid data', persistedTasks);
			return null;
		}

		return persistedTasks;
	} catch (e) {
		console.error(e);
		return null;
	}
}
