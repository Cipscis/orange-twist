import { getIdbRequestPromise } from 'utils';

import { IndexName, type ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getStatusByNameInternal(
	statusOS: IDBObjectStore,
	name: string,
): Promise<
	| DatabaseData[typeof ObjectStoreName.STATUS][number]
	| null
> {
	const statusByName = statusOS.index(IndexName.STATUS_NAME);

	// TODO: Find a way to make this type safe
	const request = statusByName.get(name) as IDBRequest<
			| DatabaseData[typeof ObjectStoreName.STATUS][number]
			| undefined
		>;

	const result = await getIdbRequestPromise(request);

	return result ?? null;
}
