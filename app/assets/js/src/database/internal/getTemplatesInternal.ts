import { getIdbRequestPromise } from 'utils/indexedDB';
import { sortBySortIndex } from 'utils';

import type { ObjectStoreName } from 'database/metadata';
import type { DatabaseData } from 'database/types';

export async function getTemplatesInternal(templateOS: IDBObjectStore): Promise<
	DatabaseData[typeof ObjectStoreName.TEMPLATE][number][]
> {
	// TODO: Find a type-safe way to do this
	const request = templateOS.getAll() as IDBRequest<
		DatabaseData[typeof ObjectStoreName.TEMPLATE][number][]
	>;

	const templates = await getIdbRequestPromise(request);
	const sortedTemplates = sortBySortIndex(templates);

	return sortedTemplates;
}
