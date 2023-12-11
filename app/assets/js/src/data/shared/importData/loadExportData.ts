import type { ExportData } from '../types/ExportData';

import { loadDays } from '../../days';
import { loadTasks } from '../../tasks';
import { loadDayTasks } from '../../dayTasks';

import { writeExportData } from '../exportData/writeExportData';

/**
 * Load ExportData into memory.
 */
export async function loadExportData(
	data: ExportData,
	isRevert = false
): Promise<void> {
	// If we're not reverting, take a backup
	const backup = isRevert ? null : writeExportData();

	try {
		await Promise.all([
			loadDays(JSON.stringify(data.days)),
			loadTasks(JSON.stringify(data.tasks)),
			loadDayTasks(JSON.stringify(data.dayTasks)),
		]);
	} catch (e) {
		if (backup) {
			// If something went wrong, try to restore the backup
			await loadExportData(backup, true);
			return;
		}

		// If restoring the backup failed, try to load persisted data again
		await Promise.all([
			loadDays(),
			loadTasks(),
			loadDayTasks(),
		]);
	}
}
