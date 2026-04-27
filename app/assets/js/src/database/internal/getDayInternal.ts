import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';
import { getIdbRequestPromise } from 'utils/indexedDB';

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
