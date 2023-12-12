import type { ExportData } from '../types/ExportData';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { loadDays } from '../../days';
import { loadTasks } from '../../tasks';
import { loadDayTasks } from '../../dayTasks';

import { writeExportData } from '../exportData/writeExportData';

/**
 * Try to load a set of data into memory. If it fails, the Promise
 * it returns will reject.
 */
async function restoreBackup(data: ExportData): Promise<void> {
	await Promise.all([
		loadDays(JSON.stringify(data.days)),
		loadTasks(JSON.stringify(data.tasks)),
		loadDayTasks(JSON.stringify(data.dayTasks)),
	]);
}

/**
 * Load ExportData into memory. If it fails, restores a backup.
 */
export async function loadExportData(data: ExportData): Promise<void> {
	// If we're not reverting, take a backup
	const backup = writeExportData();

	try {
		await restoreBackup(data);
	} catch (e) {
		try {
			// If something went wrong, try to restore the backup
			await restoreBackup(backup);
		} catch (e) {
			// If restoring the backup failed, try to load persisted data again
			await Promise.all([
				loadDays(),
				loadTasks(),
				loadDayTasks(),
			]);
		}

		// Then re-throw error so it bubbles up
		throw e;
	}

	fireCommand(Command.DATA_SAVE);
}
