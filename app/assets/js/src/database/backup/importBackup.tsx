import { h, Fragment } from 'preact';

import { noticeImport } from 'database';

import * as ui from 'ui';

import { Loader } from 'components/shared';

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
		// No valid import file was selected
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

async function getTaggedBackupDataFromFile() {
	try {
		const data = await readBackupDataFromFile();
		if (!data) {
			ui.alert('No file selected', { id: alertId });
		}
		return data;
	} catch (e) {
		ui.alert('Selected file doesn\'t contain valid data', { id: alertId });
		console.error(e);
		return null;
	}
}
