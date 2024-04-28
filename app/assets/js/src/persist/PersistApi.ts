import type { StringWithAutocomplete } from 'utils';

/**
 * Options used to configure the behaviour of a {@linkcode PersistApi}.
 */
export interface PersistOptions {
	profile?: StringWithAutocomplete<'default'>;
}

/**
 * An interface used to save and load data to a persistent medium.
 */
export interface PersistApi {
	/**
	 * Saves data to persistent storage.
	 *
	 * @param key - A string key to save data against for later retrieval
	 * @param data - A JSON serialisable value to store.
	 * @param options - An object to configure behaviour.
	 *
	 * @returns A `Promise` that resolves when the storage is complete.
	 */
	set(key: string, data: unknown, options?: PersistOptions): Promise<void>;

	/**
	 * Retrives data from persistent storage.
	 *
	 * @param key - The string key where the persisted data has been saved.
	 * @param options - An object to configure behaviour.
	 *
	 * @returns A `Promise` that resolves with the value that was saved against.
	 * the specified key, or `undefined` if no data was persisted.
	 */
	get(key: string, options?: PersistOptions): Promise<unknown>;

	/**
	 * Deletes data from persistent storage. If no data is stored against
	 * the specified key, this function does nothing.
	 *
	 * @param key - The string key where data should be deleted.
	 * @param options - An object to configure behaviour.
	 *
	 * @returns A `Promise` that resolves when the value has been deleted.
	 */
	delete(key: string, options?: PersistOptions): Promise<void>;

	/**
	 * Construct a modified {@linkcode PersistApi} with specified default options.
	 */
	bake(options: Partial<PersistOptions>): PersistApi;
}
