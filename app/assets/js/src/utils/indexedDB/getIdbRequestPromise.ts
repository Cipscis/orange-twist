/**
 * Wrap an {@linkcode IDBRequest} in a {@linkcode Promise} to make it easier to work with in `async`/`await` code.
 */
export function getIdbRequestPromise<T>(request: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		request.addEventListener('success', () => resolve(request.result));
		request.addEventListener('error', () => reject(request.error!));
	});
}
