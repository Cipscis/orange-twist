export interface PersistApi {
	/**
	 * Saves data to persistent storage.
	 *
	 * @param key - A string key to save data against for later retrieval
	 * @param data - A JSON serialisable value to store.
	 *
	 * @returns A `Promise` that resolves when the storage is complete.
	 */
	set(key: string, data: unknown): Promise<void>;

	/**
	 * Retrives data from persistent storage.
	 *
	 * @param key - The string key where the persisted data has been saved.
	 *
	 * @returns A `Promise` that resolves with the value that was saved against.
	 * the specified key, or `null` if no data was persisted.
	 */
	get(key: string): Promise<unknown>;

	/**
	 * Deletes data from persistent storage. If no data is stored against
	 * the specified key, this function does nothing.
	 *
	 * @param key - The string key where data should be deleted.
	 *
	 * @returns A `Promise` that resolves when the value has been deleted.
	 */
	delete(key: string): Promise<void>;
}
