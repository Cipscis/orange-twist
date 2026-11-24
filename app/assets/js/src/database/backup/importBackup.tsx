import { h, Fragment } from 'preact';

import { extractError } from 'utils/extractError';


import * as ui from 'ui';
import { Loader } from 'components/shared';

import type { TaggedVersionedDatabaseData } from '../types';
import { noticeImport } from '../access';
import { readBackupDataFromFile } from './readBackupDataFromFile';
import { saveBackupToDatabase } from './saveBackupToDatabase';

const alertId = 'importing';

/**
 * Prompt the user to select a file, then attempt to read it and import its contents and save it to the database.
 *
 * If an error is encountered, a UI alert will be shown.
 */
export async function importBackup(): Promise<void> {
	ui.alert(<>
		<span>Choose import file...</span>
		<Loader immediate />
	</>, {
		id: alertId,
		duration: null,
	});

	const data = await getTaggedBackupDataFromFile();
	if (!data) {
		// No import file was selected
		return;
	}

	ui.alert(<>
		<span>Importing...</span>
		<Loader immediate />
	</>, {
		id: alertId,
		duration: null,
	});

	try {
		await saveBackupToDatabase(data);
		noticeImport();
		ui.alert('Import successful', {
			id: alertId,
			duration: 2000,
		});
	} catch (e) {
		ui.alert('Import failed', {
			id: alertId,
			duration: null,
			dismissible: true,
		});
		console.error(e);
	}
}

/**
 * Prompt the user to select a file, and attempt to read a {@linkcode TaggedVersionedDatabaseData} from it. Displays a UI alert if no file was selected, or if no valid backup data was found in the selected file.
 *
 * @returns {@linkcode TaggedVersionedDatabaseData} if valid backup data was found in the selected file, or `null` otherwise.
 */
async function getTaggedBackupDataFromFile() {
	try {
		const data = await readBackupDataFromFile();
		if (!data) {
			ui.alert('No file selected', { id: alertId });
		}
		return data;
	} catch (e) {
		const error = extractError(e);
		ui.alert(error.message, { id: alertId });
		console.error(e);
		return null;
	}
}
