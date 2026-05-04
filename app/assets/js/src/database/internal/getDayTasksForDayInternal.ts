import { getIdbRequestPromise, sortBySortIndex } from 'utils';

import { IndexName, type ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getDayTasksForDayInternal(
	dayTaskOS: IDBObjectStore,
	dayId: number,
): Promise<
	DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
> {
	const dayTaskByDay = dayTaskOS.index(IndexName.DAY_TASK_DAY);

	// TODO: Find a way to make this type-safe
	const request = dayTaskByDay.getAll(dayId) as IDBRequest<
		DatabaseData[typeof ObjectStoreName.DAY_TASK][number][]
	>;

	const dayTasks = await getIdbRequestPromise(request);

	const sortedDayTasks = sortBySortIndex(dayTasks);

	return sortedDayTasks;
}
