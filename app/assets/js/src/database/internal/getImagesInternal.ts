import { getIdbRequestPromise } from 'utils';

import type { ObjectStoreName } from '../metadata';
import type { DatabaseData } from '../types';

export async function getImagesInternal(imageOS: IDBObjectStore): Promise<
	DatabaseData[typeof ObjectStoreName.IMAGE][number][]
> {
	// TODO: Find a type-safe way to do this
	const request = imageOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.IMAGE][number][]
	>;

	const result = await getIdbRequestPromise(request);

	return result;
}
