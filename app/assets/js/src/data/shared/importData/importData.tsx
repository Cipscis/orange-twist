import { h } from 'preact';

import { local } from 'persist';

import * as ui from 'ui';

import { Loader } from 'components/shared';

import { readExportDataFromFile } from './readExportDataFromFile';
import { loadExportData } from './loadExportData';

/**
 * Prompt the user to select a file, then attempt to read it and
 * import its contents as data and save it.
 *
 * If an error is encountered, a UI alert will be shown.
 */
export async function importData(): Promise<void> {
	const id = 'importing';

	ui.alert(<>
		<span>Choose import file...</span>
		<Loader immediate />
	</>, {
		id,
		duration: null,
	});

	const data = await (async () => {
		try {
			const data = await readExportDataFromFile();
			if (!data) {
				ui.alert('No file selected', { id });
			}
			return data;
		} catch (e) {
			ui.alert('Selected file doesn\'t contain valid data', { id });
			console.error(e);
			return;
		}
	})();

	if (!data) {
		// No valid import file was selected
		return;
	}

	ui.alert(<>
		<span>Importing...</span>
		<Loader immediate />
	</>, { id });

	try {
		await loadExportData(local, data);
		ui.alert('Import successful', { id, duration: 2000 });
	} catch (e) {
		ui.alert('Failed to reload data after failed import. Please refresh', { id });
	}
}
