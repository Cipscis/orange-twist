import { saveExportDataAsFile } from './saveExportDataAsFile';
import { writeExportData } from './writeExportData';

/**
 * Export all data to a file.
 */
export async function exportData(): Promise<void> {
	const data = await writeExportData();
	saveExportDataAsFile(data);
}
