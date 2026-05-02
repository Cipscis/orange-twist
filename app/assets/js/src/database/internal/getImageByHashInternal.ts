import { getIdbRequestPromise } from 'utils/indexedDB';

import { IndexName, type ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';

export async function getImageByHashInternal(
	imageOS: IDBObjectStore,
	hash: string,
): Promise<
	| DatabaseData[typeof ObjectStoreName.IMAGE][number]
	| null
> {
	const imageByHash = imageOS.index(IndexName.IMAGE_HASH);

	// TODO: Find a way to make this type-safe
	const request = imageByHash.get(hash) as IDBRequest<
		| DatabaseData[typeof ObjectStoreName.IMAGE][number]
		| undefined
	>;

	const image = await getIdbRequestPromise(request);

	return image ?? null;
}
