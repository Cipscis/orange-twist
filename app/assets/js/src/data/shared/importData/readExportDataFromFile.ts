import { chooseFile, readFileAsString } from 'utils';

import { isExportDataLike, type ExportDataLike } from '../types/ExportDataLike';

/**
 * Prompt the user to select a file, then attempt to read its
 * contents as ExportData.
 */
export async function readExportDataFromFile(): Promise<ExportDataLike | null> {
	const file = await chooseFile('application/json');
	if (!file) {
		return null;
	}

	const dataString = await readFileAsString(file);
	const data = JSON.parse(dataString);
	if (!isExportDataLike(data)) {
		throw new Error('Selected file\'s contents are not shaped like export data');
	}

	return data;
}
