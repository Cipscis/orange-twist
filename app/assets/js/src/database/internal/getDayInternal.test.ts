import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from 'utils/indexedDB';

import { ObjectStoreName } from 'database/metadata';
import { createTestData } from 'database/test-utils';
import { getDayInternal } from './getDayInternal';

describe('getDayInternal', () => {
	let dayOS: IDBObjectStore;

	beforeAll(() => createTestData());

	beforeEach(async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');
		dayOS = transaction.objectStore(ObjectStoreName.DAY);
	});

	test('returns the specified day', async () => {
		const day = await getDayInternal(dayOS, 0);

		expect(day).toEqual({
			id: 0,
			year: 2026,
			month: 4,
			day: 26,
			note: 'Test note 0',
		});
	});

	test('returns null if no day exists for that ID', async () => {
		const day = await getDayInternal(dayOS, -1);

		expect(day).toBeNull();
	});
});
