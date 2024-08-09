import type { ExportDataLike } from '../types/ExportDataLike';

import type { PersistApi } from 'persist';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import {
	loadDayTasks,
	loadDays,
	loadTasks,
	loadTemplates,
} from 'data';

import { writeExportData } from '../exportData/writeExportData';

/**
 * Try to load a set of data directly into memory.
 * If it fails, the Promise it returns will reject.
 */
async function loadExportDataDirect(
	persist: PersistApi,
	data: ExportDataLike
): Promise<void> {
	await Promise.all([
		loadDays(persist, JSON.stringify(data.days)),
		loadTasks(persist, JSON.stringify(data.tasks)),
		loadDayTasks(persist, JSON.stringify(data.dayTasks)),
		loadTemplates(persist, JSON.stringify(data.templates ?? [])),
	]);
}

/**
 * Try to load a set of data directly into memory.
 * If it fails, restores a backup.
 */
export async function loadExportData(
	persist: PersistApi,
	data: ExportDataLike
): Promise<void> {
	// Take a backup in case we hit an error
	const backup = await writeExportData();

	try {
		await loadExportDataDirect(persist, data);
	} catch (e) {
		try {
			// If something went wrong, try to restore the backup
			await loadExportDataDirect(persist, backup);
		} catch (e) {
			// If restoring the backup failed, try to load persisted data again
			await Promise.all([
				loadDays(persist),
				loadTasks(persist),
				loadDayTasks(persist),
				loadTemplates(persist),
			]);
		}

		// Then re-throw error so it bubbles up
		throw e;
	}

	fireCommand(Command.DATA_SAVE);
}
