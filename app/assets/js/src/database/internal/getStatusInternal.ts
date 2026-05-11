import { getIdbRequestPromise } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getStatusInternal(
	statusOS: IDBObjectStore,
	id: number
): Promise<
	| DatabaseData[typeof ObjectStoreName.STATUS][number]
	| null
> {
	// TODO: Find a way to make this type safe
	const request = statusOS.get(id) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.STATUS][number]
		| undefined
	>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
