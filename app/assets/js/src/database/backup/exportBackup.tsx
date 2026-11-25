import { h, Fragment } from 'preact';

import * as ui from 'ui';
import { Loader } from 'components/shared';

import { getTaggedDbDump } from '../migration';
import { dbName, dbVersion } from '../metadata';
import { saveBackupToFile } from './saveBackupToFile';

const id = 'exporting';

/**
 * Construct a database backup and prompt the user to save it to a file.
 */
export async function exportBackup(): Promise<void> {
	ui.alert(<>
		<span>Creating export file...</span>
		<Loader immediate />
	</>, {
		id,
		duration: null,
		dismissible: false,
	});

	const data = await getTaggedDbDump(dbName, dbVersion);
	ui.alert('Export file created', {
		id,
		duration: 2000,
	});
	saveBackupToFile(data);
}
