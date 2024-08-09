/**
 * A convenience function for getting an `IDBCursorWithValue` from
 * its originating `IDBRequest`, taking a Promise-based approach.
 */
async function getCursor(request: IDBRequest<IDBCursorWithValue | null>): Promise<IDBCursorWithValue | null> {
	const controller = new AbortController();
	const { signal } = controller;

	const cursor = await new Promise<IDBCursorWithValue | null>((resolve, reject) => {
		request.addEventListener(
			'success',
			() => {
				resolve(request.result);
				controller.abort();
			},
			{ signal }
		);
		request.addEventListener(
			'error',
			() => {
				reject(request.error);
				controller.abort();
			},
			{ signal }
		);
	});

	return cursor;
}

/**
 * Retrieve an asynchronous iterable iterator that yields "entry" tuples
 * consisting of an `IDBObjectStore`'s keys and values, similar to the
 * `Map.prototype.entries` family of methods.
 */
export async function* getEntries(objectStore: IDBObjectStore): AsyncGenerator<
	[IDBValidKey, unknown],
	void,
	never
> {
	const cursorRequest = objectStore.openCursor();

	let cursor = await getCursor(cursorRequest);

	while (cursor) {
		yield [cursor.key, cursor.value];

		cursor.continue();
		cursor = await getCursor(cursorRequest);
	}
}
