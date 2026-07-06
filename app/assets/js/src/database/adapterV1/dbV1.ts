import type { PersistApi } from 'persist/PersistApi';

import {
	StorageKey,
	type DayInfo,
	type DayTaskInfo,
	type TaskInfo,
	type TemplateInfo,
} from 'data';

import { adapterV1 } from './adapterV1';

/**
 * A {@linkcode PersistApi} interface for working with the IndexedDB API, reading from the database v2 but providing data with schema v1.
 */
export const dbV1: PersistApi = {
	async set(key, data) {
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
			throw new Error(`Unrecognised key ${key}`);
		}
	},

	async get(key) {
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
};
