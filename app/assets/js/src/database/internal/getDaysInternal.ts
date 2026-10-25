import { getIdbRequestPromise } from 'utils';

import { ObjectStoreName } from '../metadata';
import type { Day } from '../types';

/**
 * Takes an existing {@linkcode IDBTransaction} and adds a request to get a list of days based on a provided list of IDs.
 *
 * @param transaction An {@linkcode IDBTransaction} with read permission and access to the {@linkcode ObjectStoreName.DAY} object store.
 * @param ids A list of numeric day IDs.
 *
 * @returns A {@linkcode Promise} that resolves to an array containing each day with an ID in the `ids` param, in the same order as those IDs are provided.
 */
export async function getDaysInternal(
	transaction: IDBTransaction,
	ids: Iterable<number>,
): Promise<
	(Day | null)[]
> {
	const dayOS = transaction.objectStore(ObjectStoreName.DAY);

	const requests: IDBRequest<Day | undefined>[] = [];
	for (const id of ids) {
		// This type assertion is safe because of other controls around what can be inserted into the database
		const request = dayOS.get(id) as IDBRequest<Day | undefined>;
		requests.push(request);
	}

	// Just wait for the last request to fulfill to save on function overhead
	const lastRequest = requests.at(-1);
	if (lastRequest) {
		await getIdbRequestPromise(lastRequest);
	}

	const days = requests.map(({ result }) => result ?? null);

	return days;
}
