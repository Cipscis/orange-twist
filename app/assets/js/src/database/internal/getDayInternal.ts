import { getIdbRequestPromise } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getDayInternal(
	dayOS: IDBObjectStore,
	dayId: number,
): Promise<
	| DatabaseData[typeof ObjectStoreName.DAY][number]
	| null
> {
	// TODO: Find a type-safe way to do this
	const request = dayOS.get(dayId) as IDBRequest<
		DatabaseData[typeof ObjectStoreName.DAY][number] | undefined
	>;

	const day = await getIdbRequestPromise(request);

	return day ?? null;
}
