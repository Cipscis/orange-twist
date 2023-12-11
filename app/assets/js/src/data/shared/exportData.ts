import { getCurrentDateDayName } from 'util/index';

import type { ExportData } from './types/ExportData';

import { getAllTaskInfo } from '../tasks';
import { getAllDayInfo } from '../days';
import { encodeDayTaskKey, getAllDayTaskInfo } from '../dayTasks';

/**
 * Write all data in memory to an ExportData object.
 */
function writeExportData(): ExportData {
	const data: ExportData = {
		days: getAllDayInfo().map(
			(dayInfo) => [dayInfo.name, dayInfo]
		),
		tasks: getAllTaskInfo().map(
			(taskInfo) => [taskInfo.id, taskInfo]
		),
		dayTasks: getAllDayTaskInfo().map(
			(dayTaskInfo) => [encodeDayTaskKey(dayTaskInfo), dayTaskInfo]
		),
	};

	return data;
}

/**
 * Save an ExportData object to a file.
 */
function saveExportDataAsFile(data: ExportData): void {
	const blob = new Blob(
		[JSON.stringify(data)],
		{ type: 'application/json' }
	);

	const dataUrl = URL.createObjectURL(blob);

	const downloadLink = document.createElement('a');
	downloadLink.href = dataUrl;
	downloadLink.download = `orange-twist-export-${getCurrentDateDayName()}`;
	downloadLink.click();

	URL.revokeObjectURL(dataUrl);
}

/**
 * Export all data to a file.
 */
export function exportData(): void {
	const data = writeExportData();
	saveExportDataAsFile(data);
}
