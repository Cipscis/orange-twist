/**
 * Constructs an {@linkcode AsyncIterator} wrapper around an {@linkcode IDBCursorWithValue} for a given {@linkcode IDBObjectStore} or {@linkcode IDBIndex} and, optionally, an {@linkcode IDBKeyRange} query.
 *
 * @example
 * ```typescript
 * for await (const cursor of myIndex.getIterableCursor(keyRange)) {
 *     // Do something with the cursor, e.g. use cursor.value
 * }
 * ```
 */
export async function* getIterableCursor(
	source: IDBObjectStore | IDBIndex,
	query?: IDBKeyRange | IDBValidKey | null
): AsyncGenerator<
	Omit<IDBCursorWithValue, 'value'> & { readonly value: unknown; },
	void,
	void
> {
	const cursorRequest = source.openCursor(query);

	let cursor = await getCursorFromRequest(cursorRequest);

	while (cursor) {
		yield cursor;

		cursor.continue();
		cursor = await getCursorFromRequest(cursorRequest);
	}
}

/**
 * Convenience function for getting an `IDBCursorWithValue` via a `Promise`.
 */
function getCursorFromRequest(
	request: IDBRequest<IDBCursorWithValue | null>
): Promise<IDBCursorWithValue | null> {
	const controller = new AbortController();
	const { signal } = controller;

	return new Promise((resolve, reject) => {
		request.addEventListener('success', () => {
			resolve(request.result);
			controller.abort();
		}, { signal });

		request.addEventListener('error', () => {
			// This non-null assertion is safe within an error callback
			reject(request.error!);
			controller.abort();
		}, { signal });
	});
}
