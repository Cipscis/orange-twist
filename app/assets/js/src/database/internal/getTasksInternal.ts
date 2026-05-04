import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getTasksInternal(tasksOS: IDBObjectStore): Promise<
	DatabaseData[typeof ObjectStoreName.TASK][number][]
> {
	// TODO: Find a type-safe way to do this
	const request = tasksOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.TASK][number][]
	>;

	const tasks = await getIdbRequestPromise(request);
	const sortedTasks = sortBySortIndex(tasks);

	return sortedTasks;
}
