import { getIdbRequestPromise } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

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
