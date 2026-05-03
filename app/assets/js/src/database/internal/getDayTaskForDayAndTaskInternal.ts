import { getIdbRequestPromise } from 'utils/indexedDB';

import { IndexName, type ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getDayTaskForDayAndTaskInternal(
	dayTaskOS: IDBObjectStore,
	dayTask: Pick<
		DatabaseData[typeof ObjectStoreName.DAY_TASK][number], 'day' | 'task'
	>
): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY_TASK][number]
	| null
> {
	const dayTaskByDayAndTask = dayTaskOS.index(IndexName.DAY_TASK_DAY_TASK);

	// TODO: Find a type-safe way to do this
	const request = dayTaskByDayAndTask.get([dayTask.day, dayTask.task]) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.DAY_TASK][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
