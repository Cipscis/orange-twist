import { describe, test } from '@jest/globals';

describe('loadExportData', () => {
	test.todo('returns a Promise that resolves when correct export data is passed');

	test.todo('saves changes if import was successful');

	test.todo('returns a Promise that rejects when incorrect export data is passed');

	test.todo('reverts to backed up data if any part of the import failed');

	test.todo('reverts to persisted data if reverting to backup failed');

	test.todo('updates old export data');
});
