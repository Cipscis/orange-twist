import { clearDatabase } from './clearDatabase';

import { getDatabase, getIdbRequestPromise } from 'utils/indexedDB';

import type { DatabaseData } from 'database/types';
import { ObjectStoreName } from 'database/metadata';

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

	const dayOS = transaction.objectStore(ObjectStoreName.DAY);
	const statusOS = transaction.objectStore(ObjectStoreName.STATUS);
	const taskOS = transaction.objectStore(ObjectStoreName.TASK);
	const dayTaskOS = transaction.objectStore(ObjectStoreName.DAY_TASK);
	const templateOS = transaction.objectStore(ObjectStoreName.TEMPLATE);
	const imageOS = transaction.objectStore(ObjectStoreName.IMAGE);

	const requests: IDBRequest[] = [];

	// TODO: Once it exists, use the database API for setting data

	// Insert test days
	requests.push(dayOS.put({
		id: 0,
		year: 2026,
		month: 4,
		day: 26,
		note: 'Test note 0',
	} satisfies DatabaseData[typeof ObjectStoreName.DAY][number]));

	requests.push(dayOS.put({
		id: 1,
		year: 2026,
		month: 4,
		day: 27,
		note: 'Test note 1',
	} satisfies DatabaseData[typeof ObjectStoreName.DAY][number]));

	requests.push(dayOS.put({
		id: 2,
		year: 2026,
		month: 1,
		day: 1,
		note: 'Test note 2',
	} satisfies DatabaseData[typeof ObjectStoreName.DAY][number]));

	// Insert test statuses
	requests.push(statusOS.put({
		id: 0,
		name: 'todo',
		isComplete: false,
	} satisfies DatabaseData[typeof ObjectStoreName.STATUS][number]));

	requests.push(statusOS.put({
		id: 1,
		name: 'in-progress',
		isComplete: false,
	} satisfies DatabaseData[typeof ObjectStoreName.STATUS][number]));

	requests.push(statusOS.put({
		id: 2,
		name: 'complete',
		isComplete: true,
	} satisfies DatabaseData[typeof ObjectStoreName.STATUS][number]));

	// Insert test tasks
	requests.push(taskOS.put({
		id: 0,
		name: 'Test task 0',
		note: 'Test task 0 note',
		status: 0,
		sortIndex: 1,
	} satisfies DatabaseData[typeof ObjectStoreName.TASK][number]));

	requests.push(taskOS.put({
		id: 1,
		name: 'Test task 1',
		note: 'Test task 1 note',
		status: 1,
		sortIndex: 2,
	} satisfies DatabaseData[typeof ObjectStoreName.TASK][number]));

	requests.push(taskOS.put({
		id: 2,
		name: 'Test task 2',
		note: 'Test task 2 note',
		status: 1,
		sortIndex: 0,
	} satisfies DatabaseData[typeof ObjectStoreName.TASK][number]));

	// Insert test day tasks
	requests.push(dayTaskOS.put({
		id: 0,
		day: 0,
		task: 0,
		note: 'Note for task 0 day 0',
		summary: 'Summary for task 0 day 0',
		status: 1,
		sortIndex: 1,
	} satisfies DatabaseData[typeof ObjectStoreName.DAY_TASK][number]));

	requests.push(dayTaskOS.put({
		id: 1,
		day: 0,
		task: 1,
		note: 'Note for task 1 day 0',
		summary: 'Summary for task 1 day 0',
		status: 1,
		sortIndex: 0,
	} satisfies DatabaseData[typeof ObjectStoreName.DAY_TASK][number]));

	// Insert test templates
	requests.push(templateOS.put({
		id: 0,
		name: 'Template 0 name',
		template: 'Template 0',
		sortIndex: 1,
	} satisfies DatabaseData[typeof ObjectStoreName.TEMPLATE][number]));

	requests.push(templateOS.put({
		id: 1,
		name: 'Template 1 name',
		template: 'Template 1',
		sortIndex: 0,
	} satisfies DatabaseData[typeof ObjectStoreName.TEMPLATE][number]));

	// Insert test images

	// Working with image Blobs causes problems working with the FileReader, so just use some data that can be read from the Blob directly
	const testImageBlob = new Blob(['test data'], { type: 'text/plain' });

	requests.push(imageOS.put({
		id: 0,
		file: testImageBlob,
		hash: 'test-hash',
	} satisfies DatabaseData[typeof ObjectStoreName.IMAGE][number]));

	await Promise.all(
		requests.map((request) => getIdbRequestPromise(request))
	);
}
