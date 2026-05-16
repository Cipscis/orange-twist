import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { clearDatabase } from '../test-utils';

import { getDayInternal } from './getDayInternal';

import { addDayInternal } from './addDayInternal';

describe('addDayInternal', () => {
	beforeEach(() => clearDatabase());

	test('inserts a new day into the database, and returns its ID', async () => {
		const db = await getDatabase(true);
		const writeTransaction = db.transaction(ObjectStoreName.DAY, 'readwrite');

		const writeResult = await addDayInternal(writeTransaction, {
			year: 2026,
			month: 5,
			day: 3,
			note: 'Test note',
		});

		expect(writeResult).toBe(1);

		const readTransaction = db.transaction(ObjectStoreName.DAY, 'readonly');
		const readDayOS = readTransaction.objectStore(ObjectStoreName.DAY);

		const readResult = await getDayInternal(readDayOS, 1);

		expect(readResult).toEqual({
			id: 1,
			year: 2026,
			month: 5,
			day: 3,
			note: 'Test note',
		});
	});

	test('throws an error if a day already exists with that date', async () => {
		const db = await getDatabase(true);
		const transaction = db.transaction(ObjectStoreName.DAY, 'readwrite');

		// Add a day first
		await addDayInternal(transaction, {
			year: 2026,
			month: 5,
			day: 3,
			note: 'Test note',
		});

		// Then try adding it again
		await expect(
			() => addDayInternal(transaction, {
				year: 2026,
				month: 5,
				day: 3,
				note: 'Test note',
			})
		).rejects.toBeInstanceOf(Error);
	});
});
