import { getIterableCursor } from './getIterableCursor';

/**
 * Retrieve an asynchronous iterable iterator that yields "entry" tuples
 * consisting of an `IDBObjectStore`'s keys and values, similar to the
 * `Map.prototype.entries` family of methods.
 */
export async function* getEntries(objectStore: IDBObjectStore): AsyncGenerator<
	[IDBValidKey, unknown],
	void,
	void
> {
	for await (const cursor of getIterableCursor(objectStore)) {
		yield [cursor.key, cursor.value];
	}
}
