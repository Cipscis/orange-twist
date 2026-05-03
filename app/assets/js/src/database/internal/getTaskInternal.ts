import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';
import { getIdbRequestPromise } from 'utils/indexedDB';

export async function getTaskInternal(
	taskOS: IDBObjectStore,
	id: number
): Promise<
	| DatabaseData[typeof ObjectStoreName.TASK][number]
	| null
> {
	// TODO: Find a way to make this type safe
	const request = taskOS.get(id) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.TASK][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
