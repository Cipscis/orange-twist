import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getDayTasksInternal(dayTaskOS: IDBObjectStore): Promise<
	DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
> {
	// TODO: Find a type-safe way to do this
	const request = dayTaskOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
	>;

	const dayTasks = await getIdbRequestPromise(request);
	const sortedDayTasks = sortBySortIndex(dayTasks);

	return sortedDayTasks;
}
