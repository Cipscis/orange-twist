import type { PersistApi } from 'persist/PersistApi';

/**
 * A {@linkcode PersistApi} interface for working with the
 * localStorage API.
 */
export const ls: PersistApi = {
	set(key, data) {
		return new Promise((resolve, reject) => {
			try {
				const jsonData = JSON.stringify(data);
				localStorage.setItem(key, jsonData);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	},

	get(key) {
		return new Promise((resolve, reject) => {
			try {
				const jsonData = localStorage.getItem(key);
				if (jsonData === null) {
					resolve(undefined);
					return;
				}
				const data = JSON.parse(jsonData);
				resolve(data);
			} catch (e) {
				reject(e);
			}
		});
	},

	delete(key) {
		return new Promise((resolve, reject) => {
			try {
				localStorage.removeItem(key);
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	},
};
