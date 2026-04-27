import { IndexName, type ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';
import { sortBySortIndex } from 'utils';
import { getIdbRequestPromise } from 'utils/indexedDB';

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
