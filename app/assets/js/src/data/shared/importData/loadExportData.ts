import type { ExportDataLike } from '../types/ExportDataLike';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { loadDays } from '../../days';
import { loadTasks } from '../../tasks';
import { loadDayTasks } from '../../dayTasks';

import { writeExportData } from '../exportData/writeExportData';

/**
 * Try to load a set of data directly into memory.
 * If it fails, the Promise it returns will reject.
 */
async function loadExportDataDirect(data: ExportDataLike): Promise<void> {
	await Promise.all([
		loadDays(JSON.stringify(data.days)),
		loadTasks(JSON.stringify(data.tasks)),
		loadDayTasks(JSON.stringify(data.dayTasks)),
	]);
}

/**
 * Try to load a set of data directly into memory.
 * If it fails, restores a backup.
 */
export async function loadExportData(data: ExportDataLike): Promise<void> {
	// Take a backup in case we hit an error
	const backup = writeExportData();

	try {
		await loadExportDataDirect(data);
	} catch (e) {
		try {
			// If something went wrong, try to restore the backup
			await loadExportDataDirect(backup);
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
