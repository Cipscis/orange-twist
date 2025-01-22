import { h } from 'preact';

import { Loader } from 'components/shared';
import * as ui from 'ui';

import { saveExportDataAsFile } from './saveExportDataAsFile';
import { writeExportData } from './writeExportData';

/**
 * Export all data to a file.
 */
export async function exportData(): Promise<void> {
	const id = 'exporting';

	ui.alert(<>
		<span>Creating export file...</span>
		<Loader immediate />
	</>, {
		id,
		duration: null,
		dismissible: false,
	});

	const data = await writeExportData();
	ui.alert('Export file created', {
		id,
		duration: 2000,
	});
	saveExportDataAsFile(data);
}
