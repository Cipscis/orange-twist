import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';
import { getIdbRequestPromise } from 'utils/indexedDB';

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
