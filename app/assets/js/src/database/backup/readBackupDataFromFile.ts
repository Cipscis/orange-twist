import { chooseFile } from 'utils/chooseFile';
import { readFileAsString } from 'utils/readFileAsString';

import type { TaggedLegacyExportData } from '../types';
// TODO: Tidy up this import
// TODO: Make and use a general VersionedBackupData type
import {
	isLegacyBackupDataV1_0_0,
	type LegacyBackupDataV1_0_0,
} from '../types/LegacyExportDataVersions/LegacyExportDataV1_0_0';
import { tagLegacyExportData } from '../migration';

function transformData(exportData: LegacyBackupDataV1_0_0): TaggedLegacyExportData {
	const transformedExportData = {
		data: {
			days: exportData.days,
			tasks: exportData.tasks,
			['day-tasks']: exportData['dayTasks'],
			templates: exportData.templates,
		},
		images: Object.fromEntries(exportData.images ?? []),
	};
	return tagLegacyExportData(transformedExportData);
}

/**
 * Prompt the user to select a file, then attempt to read its contents and provide a {@linkcode TaggedLegacyExportData}.
 */
export async function readBackupDataFromFile(): Promise<TaggedLegacyExportData | null> {
	const file = await chooseFile('application/json');
	if (!file) {
		return null;
	}

	const dataString = await readFileAsString(file);
	const data = JSON.parse(dataString);
	if (!isLegacyBackupDataV1_0_0(data)) {
		throw new Error('Selected file\'s contents are not shaped like export data');
	}

	return transformData(data);
}
