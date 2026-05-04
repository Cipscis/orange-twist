import { getIdbRequestPromise } from 'utils';

import { IndexName, type ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getDayByDateInternal(
	dayOS: IDBObjectStore,
	date: Pick<
		DatabaseData[typeof ObjectStoreName.DAY][number], 'year' | 'month' | 'day'
	>
): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY][number]
	| null
> {
	const { year, month, day } = date;
	const dayByDate = dayOS.index(IndexName.DAY_DATE);

	// TODO: Find a type-safe way to do this
	const request = dayByDate.get([year, month, day]) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.DAY][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
