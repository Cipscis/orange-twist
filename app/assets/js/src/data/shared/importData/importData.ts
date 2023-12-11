import * as ui from 'ui';

import { Command } from 'types/Command';
import { fireCommand } from 'registers/commands';

import { readExportDataFromFile } from './readExportDataFromFile';
import { loadExportData } from './loadExportData';

/**
 * Prompt the user to select a file, then attempt to read it and
 * import its contents as data and save it.
 *
 * If an error is encountered, a UI alert will be shown.
 */
export async function importData(): Promise<void> {
	const data = await (async () => {
		try {
			return await readExportDataFromFile();
		} catch (e) {
			ui.alert('Selected file doesn\'t contain valid data');
			return;
		}
	})();

	if (!data) {
		// No file was selected
		return;
	}

	try {
		await loadExportData(data);
	} catch (e) {
		ui.alert('Failed to reload data after failed import. Please refresh');
		return;
	}

	fireCommand(Command.DATA_SAVE);
}
