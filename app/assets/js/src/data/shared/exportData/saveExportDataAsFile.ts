import { getCurrentDateDayName } from 'util/index';

import type { ExportData } from '../types/ExportData';

/**
 * Save an ExportData object to a file.
 */
export function saveExportDataAsFile(data: ExportData): void {
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
