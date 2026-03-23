import type { PersistApi } from 'persist';

/**
 * Either a string containing serialised data, or a {@linkcode PersistApi} with a key to read from.
 */
export type DataSource = {
	persist: PersistApi;
	key: string;
} | {
	data: string;
};
