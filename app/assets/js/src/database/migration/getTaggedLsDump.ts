import {
	isLegacyExportDataV1_0_0,
	type LegacyExportDataV1_0_0,
	type TaggedLegacyExportData,
} from 'database/types';
import { tagLegacyExportData } from './tagLegacyExportData';

const StorageKey = {
	DAY: 'days',
	TASK: 'tasks',
	DAY_TASK: 'day-tasks',
	TEMPLATE: 'templates',
} as const;

/**
 * Exports data from version 1.4.0 or earlier from localStorage, if it exists.
 *
 * @throws Error if invalid JSON is encountered
 * @throws Error if serialised JSON doesn't match expected data shape
 */
export function getTaggedLsDump(): TaggedLegacyExportData | null {
	const daysJson = localStorage.getItem(StorageKey.DAY);
	const tasksJson = localStorage.getItem(StorageKey.TASK);
	const dayTasksJson = localStorage.getItem(StorageKey.DAY_TASK);

	if (!(daysJson && tasksJson && dayTasksJson)) {
		return null;
	}

	const templatesJson = localStorage.getItem(StorageKey.TEMPLATE);

	const dump: LegacyExportDataV1_0_0 = {
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

	if (!isLegacyExportDataV1_0_0(dump)) {
		throw new TypeError('Data persisted in localStorage was of an unknown format');
	}

	const taggedDump = tagLegacyExportData(dump);
	return taggedDump;
}
