import { StorageKey } from 'data/shared';
import type { PersistApi } from 'persist/PersistApi';
import {
	doDatabaseTransaction,
} from 'utils';

import type { DayInfo } from 'data/days';
import type { DayTaskInfo } from 'data/dayTasks';
import type { TaskInfo } from 'data/tasks';
import type { TemplateInfo } from 'data/templates';

import { adapterV1 } from 'database';
import { getDatabase, getDatabaseVersion } from '../utils';
import { ObjectStoreName } from '../metadata';

/**
 * A {@linkcode PersistApi} interface for working with the IndexedDB API, reading from the database v2 but providing data with schema v1.
 */
export const dbV1: PersistApi = {
	async set(key, data) {
		// TODO: Get rid of this unnecessary retrieval, just used to make sure the database has been upgraded first
		await getDatabase();
		// TODO: Get rid of this database v1 handling
		const dbVersion = await getDatabaseVersion();
		if (dbVersion === 1 || dbVersion === null) {
			return await doDatabaseTransaction(
				'readwrite',
				[ObjectStoreName.DATA],
				([objectStore]) => objectStore.put(data, key)
			) as Promise<void>;
		}

		// TODO: Implement v2 handling
		if (key === StorageKey.DAYS) {
			return adapterV1.setDays(
				data as [string, DayInfo][]
			);
		} else if (key === StorageKey.DAY_TASKS) {
			return adapterV1.setDayTasks(
				data as [string, DayTaskInfo][]
			);
		} else if (key === StorageKey.TASKS) {
			return adapterV1.setTasks(
				data as [number, TaskInfo][]
			);
		} else if (key === StorageKey.TEMPLATES) {
			return adapterV1.setTemplates(
				data as [number, TemplateInfo][]
			);
		} else {
			throw new Error('Setting with idb not implemented');
		}
	},

	async get(key) {
		// TODO: Get rid of this unnecessary retrieval, just used to make sure the database has been upgraded first
		await getDatabase();
		// TODO: Get rid of this database v1 handling
		const dbVersion = await getDatabaseVersion();
		if (dbVersion === 1 || dbVersion === null) {
			return doDatabaseTransaction(
				'readonly',
				[ObjectStoreName.DATA],
				([objectStore]) => objectStore.get(key)
			);
		}

		if (key === StorageKey.DAYS) {
			return adapterV1.getDays();
		} else if (key === StorageKey.DAY_TASKS) {
			return adapterV1.getDayTasks();
		} else if (key === StorageKey.TASKS) {
			return adapterV1.getTasks();
		} else if (key === StorageKey.TEMPLATES) {
			return adapterV1.getTemplates();
		} else {
			throw new RangeError(`Unrecognised key ${key}`);
		}
	},

	async delete(key) {
		await doDatabaseTransaction(
			'readwrite',
			[ObjectStoreName.DATA],
			([objectStore]) => objectStore.delete(key)
		);
	},
};
