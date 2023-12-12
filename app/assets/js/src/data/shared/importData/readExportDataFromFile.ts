import { chooseFile, readFileAsString } from 'util/index';

import { isExportData, type ExportData } from '../types/ExportData';

/**
 * Prompt the user to select a file, then attempt to read its
 * contents as ExportData.
 */
export async function readExportDataFromFile(): Promise<ExportData | null> {
	const file = await chooseFile('application/json');
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
