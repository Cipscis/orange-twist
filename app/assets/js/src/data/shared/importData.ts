import { chooseFile, readFileAsString } from 'util/index';
import * as ui from 'ui';

import { isExportData, type ExportData } from './types/ExportData';
import { Command } from 'types/Command';

import { fireCommand } from 'registers/commands';

import { loadDays } from '../days';
import { loadTasks } from '../tasks';
import { loadDayTasks } from '../dayTasks';

/**
 * Prompt the user to select a file, then attempt to read its
 * contents as ExportData.
 */
async function readExportDataFromFile(): Promise<ExportData | null> {
	const file = await chooseFile();
	if (!file) {
		return null;
	}

	const dataString = await readFileAsString(file);
	try {
		const data = JSON.parse(dataString);
		if (!isExportData(data)) {
			throw new Error('Selected file does not contain valid export data');
		}

		return data;
	} catch (e) {
		throw new Error('Could not parse selected file as JSON');
	}
}

/**
 * Load ExportData into memory.
 */
async function loadExportData(data: ExportData): Promise<void> {
	await Promise.all([
		loadDays(JSON.stringify(data.days)),
		loadTasks(JSON.stringify(data.tasks)),
		loadDayTasks(JSON.stringify(data.dayTasks)),
	]);
}

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

	await loadExportData(data);

	fireCommand(Command.DATA_SAVE);
}
