import { StorageKey } from 'data';

import {
	isDatabaseDataV1_0_0,
	type DatabaseDataV1_0_0,
	type TaggedVersionedDatabaseData,
} from '../types';

import { tagVersionedDatabaseData } from './tagVersionedDatabaseData';

/**
 * Exports data from version 1.4.0 or earlier from localStorage, if it exists.
 *
 * @throws Error if invalid JSON is encountered
 * @throws Error if serialised JSON doesn't match expected data shape
 */
export function getTaggedLsDump(): TaggedVersionedDatabaseData | null {
	const daysJson = localStorage.getItem(StorageKey.DAYS);
	const tasksJson = localStorage.getItem(StorageKey.TASKS);
	const dayTasksJson = localStorage.getItem(StorageKey.DAY_TASKS);

	if (!(daysJson && tasksJson && dayTasksJson)) {
		return null;
	}

	const templatesJson = localStorage.getItem(StorageKey.TEMPLATES);

	const dump: DatabaseDataV1_0_0 = {
		data: {
			days: [],
			tasks: [],
			'day-tasks': [],
		},
	};

	// These type assertions are safe because we validate the data right after
	if (daysJson) {
		const daysData = JSON.parse(daysJson);
		dump.data.days = daysData as typeof dump.data.days;
	}

	if (tasksJson) {
		const tasksData = JSON.parse(tasksJson);
		dump.data.tasks = tasksData as typeof dump.data.tasks;
	}

	if (dayTasksJson) {
		const dayTasksData = JSON.parse(dayTasksJson);
		dump.data['day-tasks'] = dayTasksData as typeof dump.data['day-tasks'];
	}

	if (templatesJson) {
		const templateData = JSON.parse(templatesJson);
		dump.data.templates = templateData as typeof dump.data.templates;
	}

	if (!isDatabaseDataV1_0_0(dump)) {
		throw new TypeError('Data persisted in localStorage was of an unknown format');
	}

	const taggedDump = tagVersionedDatabaseData(dump);
	return taggedDump;
}
