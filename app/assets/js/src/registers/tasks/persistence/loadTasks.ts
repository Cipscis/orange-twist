import { z } from 'zod';

import type { Task } from 'types/Task';
import { taskSchema } from 'types/Task';

import { isZodSchemaType } from 'util/index';

const validTasksDataSchema = z.array(
	z.tuple([
		z.number(),
		taskSchema,
	])
);

const isValidTasksData = isZodSchemaType(validTasksDataSchema);

/**
 * Load data for the tasks register from where it was persisted.
 */
export async function loadTasks(): Promise<Iterable<[number, Task]>> {
	const serialisedTasks = localStorage.getItem('tasks');
	if (serialisedTasks === null) {
		return [];
	}

	const persistedTasks = JSON.parse(serialisedTasks) as unknown;

	if (!isValidTasksData(persistedTasks)) {
		throw new TypeError('Invalid tasks data');
	}

	return persistedTasks;
}
