import { chooseFile } from 'utils/chooseFile';
import { readFileAsString } from 'utils/readFileAsString';

import {
	type TaggedVersionedDatabaseData,
	type BackupDataV1_0_0,
	isBackupDataV1_0_0,
} from '../types';

/**
 * Converts a {@linkcode BackupDataV1_0_0} to a {@linkcode TaggedVersionedDatabaseData} so it can be imported.
 */
function transformBackupData(exportData: BackupDataV1_0_0): TaggedVersionedDatabaseData {
	return {
		schemaVersion: '1.0.0',
		data: {
			data: {
				days: exportData.days,
				tasks: exportData.tasks,
				['day-tasks']: exportData['dayTasks'],
				templates: exportData.templates,
			},
			images: Object.fromEntries(exportData.images ?? []),
		},
	};
}

/**
 * Prompt the user to select a file, then attempt to read its contents and provide a {@linkcode TaggedVersionedDatabaseData}.
 *
 * @returns Valid backup data if any was found in the selected file, or `null` if no file was selected.
 * @throws {Error} if a file was selected but no valid backup data was found.
 */
export async function readBackupDataFromFile(): Promise<TaggedVersionedDatabaseData | null> {
	const file = await chooseFile('application/json');
	if (!file) {
		return null;
	}

	try {
		const dataString = await readFileAsString(file);
		const data = JSON.parse(dataString);
		if (!isBackupDataV1_0_0(data)) {
			throw new Error('Selected file does not contain valid backup data');
		}

		return transformBackupData(data);
	} catch (e) {
		throw new Error('Selected file does not contain valid backup data');
	}
}
