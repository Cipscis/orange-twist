import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { updateDayInternal } from './updateDayInternal';
import { getDayByDateInternal } from './getDayByDateInternal';

describe('updateDayInternal', () => {
	let transaction: IDBTransaction;
	let dayOS: IDBObjectStore;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction(ObjectStoreName.DAY, 'readwrite');
		dayOS = transaction.objectStore(ObjectStoreName.DAY);
	});

	test('updates a specified day', async () => {
		const result = await updateDayInternal(dayOS, {
			year: 2026,
			month: 4,
			day: 27,
			note: 'Updated note',
		});

		expect(result).toBeUndefined();

		const updatedDay = await getDayByDateInternal(transaction, {
			year: 2026,
			month: 4,
			day: 27,
		});

		expect(updatedDay?.note).toBe('Updated note');
	});

	test('throws an error if the day doesn\'t exist', async () => {
		await expect(updateDayInternal(dayOS, {
			year: 2020,
			month: 1,
			day: 1,
			note: 'Failed update',
		})).rejects.toBeInstanceOf(Error);
	});
});
