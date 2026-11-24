import { chooseFile } from 'utils/chooseFile';
import { readFileAsString } from 'utils/readFileAsString';

import {
	type TaggedVersionedDatabaseData,
	type BackupDataV1_0_0,
	isBackupDataV1_0_0,
	isVersionedDatabaseData,
} from '../types';
import { tagVersionedDatabaseData } from 'database/migration';

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
 * The process of parsing serialised backup data is asynchronous, since `data:` URLs need to be reformed into `Blob` data.
 *
 * This is accomplished by running two rounds of parsing. The first finds all `data:` URLs and starts constructing their respective `Blob`s. Once that is finished, the second round replaces them synchronously with those `Blob`s.
 */
async function parseBackupData(serialisedData: string): Promise<unknown> {
	const isDataUrl = (value: unknown): value is string => (
		typeof value === 'string' &&
		/^data:/.test(value)
	);

	const blobs = new Map<string, Blob>();
	const promises: Promise<void>[] = [];
	// 1. Find all `data:` URLs and start reading them as Blobs. Throw away the actual parse result
	JSON.parse(serialisedData, (key, value) => {
		if (!isDataUrl(value)) {
			return value as unknown;
		}

		promises.push(
			fetch(value)
				.then(
					(response) => response.blob()
				)
				.then((blob) => { blobs.set(value, blob); })
		);
	});
	// 1.5 Wait for all those Blobs to be created
	await Promise.all(promises);
	// 2. Parse the data again, synchronously replacing and `data:` URLs with their respective Blobs
	return JSON.parse(serialisedData, (key, value) => {
		if (!isDataUrl(value)) {
			return value as unknown;
		}

		return blobs.get(value);
	});
}

/**
 * Prompt the user to select a file, then attempt to read its contents and provide a {@linkcode TaggedVersionedDatabaseData}.
 *
 * @returns Valid backup data if any was found in the selected file, or `null` if no file was selected.
 * @throws {Error} if a file was selected but no valid backup data was found.
 */
export async function readBackupFromFile(): Promise<TaggedVersionedDatabaseData | null> {
	const file = await chooseFile('application/json');
	if (!file) {
		return null;
	}

	try {
		const dataString = await readFileAsString(file);

		const data = await parseBackupData(dataString);

		if (isBackupDataV1_0_0(data)) {
			return transformBackupData(data);
		}

		if (isVersionedDatabaseData(data)) {
			return tagVersionedDatabaseData(data);
		}

		throw new Error('Selected file does not contain valid backup data');
	} catch (e) {
		console.error(e);
		throw new Error('Selected file does not contain valid backup data');
	}
}
