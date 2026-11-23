import { chooseFile } from 'utils/chooseFile';
import { readFileAsString } from 'utils/readFileAsString';

import {
	type TaggedVersionedDatabaseData,
	type BackupDataV1_0_0,
	isBackupDataV1_0_0,
} from '../types';
import { tagVersionedDatabaseData } from '../migration';

/**
 * Converts a {@linkcode BackupDataV1_0_0} to a {@linkcode TaggedVersionedDatabaseData} so it can be imported.
 */
function transformBackupData(exportData: BackupDataV1_0_0): TaggedVersionedDatabaseData {
	const transformedExportData = {
		data: {
			days: exportData.days,
			tasks: exportData.tasks,
			['day-tasks']: exportData['dayTasks'],
			templates: exportData.templates,
		},
		images: Object.fromEntries(exportData.images ?? []),
	};
	return tagVersionedDatabaseData(transformedExportData);
}

/**
 * Prompt the user to select a file, then attempt to read its contents and provide a {@linkcode TaggedVersionedDatabaseData}.
 */
export async function readBackupDataFromFile(): Promise<TaggedVersionedDatabaseData | null> {
	const file = await chooseFile('application/json');
	if (!file) {
		return null;
	}

	const dataString = await readFileAsString(file);
	const data = JSON.parse(dataString);
	if (!isBackupDataV1_0_0(data)) {
		throw new Error('Selected file\'s contents are not shaped like export data');
	}

	return transformBackupData(data);
}
