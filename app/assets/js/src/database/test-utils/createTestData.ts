import { clearDatabase } from './clearDatabase';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	addDayInternal,
	addDayTaskInternal,
	addImageInternal,
	addStatusInternal,
	addTaskInternal,
	addTemplateInternal,
} from '../internal';

/**
 * **Important!** For use within tests only.
 *
 * Construct an Orange Twist database v2 containing test data.
 */
export async function createTestData(): Promise<void> {
	// Start with a fresh database
	await clearDatabase();
	const database = await getDatabase(true);

	const transaction = database.transaction([
		ObjectStoreName.DAY,
		ObjectStoreName.TASK,
		ObjectStoreName.DAY_TASK,
		ObjectStoreName.STATUS,
		ObjectStoreName.TEMPLATE,
		ObjectStoreName.IMAGE,
	], 'readwrite');

	// Insert test days
	addDayInternal(transaction, {
		year: 2026,
		month: 4,
		day: 26,
		note: 'Test note 1',
	});

	addDayInternal(transaction, {
		year: 2026,
		month: 4,
		day: 27,
		note: 'Test note 2',
	});

	addDayInternal(transaction, {
		year: 2026,
		month: 1,
		day: 1,
		note: 'Test note 3',
	});

	// Insert test statuses
	addStatusInternal(transaction, {
		alias: 'todo',
	});

	addStatusInternal(transaction, {
		alias: 'in-progress',
	});

	addStatusInternal(transaction, {
		alias: 'completed',
	});

	// Insert test tasks
	addTaskInternal(transaction, {
		name: 'Test task 1',
		note: 'Test task 1 note',
		sortIndex: 1,
	});

	addTaskInternal(transaction, {
		name: 'Test task 2',
		note: 'Test task 2 note',
		sortIndex: 2,
	});

	addTaskInternal(transaction, {
		name: 'Test task 3',
		note: 'Test task 3 note',
		sortIndex: 0,
	});

	// Insert test day tasks
	addDayTaskInternal(transaction, {
		day: 1,
		task: 1,
		note: 'Note for task 1 day 1',
		summary: 'Summary for task 1 day 1',
		status: 2,
		sortIndex: 1,
	});

	addDayTaskInternal(transaction, {
		day: 1,
		task: 2,
		note: 'Note for task 2 day 1',
		summary: 'Summary for task 2 day 1',
		status: 2,
		sortIndex: 0,
	});

	// Insert test templates
	addTemplateInternal(transaction, {
		name: 'Template 1 name',
		template: 'Template 1',
		sortIndex: 1,
	});

	addTemplateInternal(transaction, {
		name: 'Template 2 name',
		template: 'Template 2',
		sortIndex: 0,
	});

	// Insert test images
	addImageInternal(transaction, {
		hash: 'test-hash',
		// Working with image Blobs causes problems working with the FileReader, so just use some data that can be read from the Blob directly
		file: new Blob(['test data'], { type: 'text/plain' }),
	});
}
