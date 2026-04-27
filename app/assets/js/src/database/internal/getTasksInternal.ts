import { sortBySortIndex } from 'utils';
import { getIdbRequestPromise } from 'utils/indexedDB';

import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';

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
