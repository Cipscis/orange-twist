import type { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';

let transactionPromise: null | Promise<IDBTransaction> = null;
let requestedMode: IDBTransactionMode = 'readonly';
const requestedObjectStores = new Set<ObjectStoreName>();

/**
 * Registers interest for a database transaction with write access to a set of object stores.
 *
 * Multiple requests can be made concurrently, which will result in a single transaction with access to all requested data stores, allowing for efficient use of database transactions.
 */
export async function requestTransaction(
	objectStores: Iterable<ObjectStoreName>,
	mode: IDBTransactionMode,
): Promise<IDBTransaction> {
	// Register interest for requested object stores
	for (const store of objectStores) {
		requestedObjectStores.add(store);
	}

	// Register interest for requested mode
	if (mode === 'readwrite') {
		requestedMode = mode;
	}

	// Allow time for more requests to accumulate
	await new Promise<void>(
		(resolve) => queueMicrotask(() => resolve())
	);

	if (transactionPromise) {
		// Another request is handling fulfilling the promise
		return transactionPromise;
	}

	// Resolve a promise to a transaction with all requested object stores
	const { promise, resolve } = Promise.withResolvers<IDBTransaction>();
	transactionPromise = promise;

	const db = await getDatabase();
	const transaction = db.transaction(
		Array.from(requestedObjectStores),
		requestedMode,
	);

	// Clean up requested information
	transactionPromise = null;
	requestedMode = 'readonly';
	requestedObjectStores.clear();

	resolve(transaction);

	return promise;
}
