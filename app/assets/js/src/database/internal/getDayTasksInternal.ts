import { sortBySortIndex } from 'utils';
import { getIdbRequestPromise } from 'utils/indexedDB';

import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';

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
