import { saveExportDataAsFile } from './saveExportDataAsFile';
import { writeExportData } from './writeExportData';

/**
 * Export all data to a file.
 */
export function exportData(): void {
	const data = writeExportData();
	saveExportDataAsFile(data);
}
