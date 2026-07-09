import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getDayInternal } from './getDayInternal';

import { updateDayInternal } from './updateDayInternal';

describe('updateDayInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction(ObjectStoreName.DAY, 'readwrite');
	});

	test('updates a specified day', async () => {
		const result = await updateDayInternal(transaction, {
			id: 1,
			note: 'Updated note',
		});

		expect(result).toBeUndefined();

		const updatedDay = await getDayInternal(transaction, 1);

		expect(updatedDay?.note).toBe('Updated note');
	});

	test('throws an error if the day doesn\'t exist', async () => {
		await expect(updateDayInternal(transaction, {
			id: -1,
			note: 'Failed update',
		})).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if the year, month, or day properties were modified', async () => {
		await expect(updateDayInternal(transaction, {
			id: 1,
			year: 2020,
		})).rejects.toBeInstanceOf(Error);

		await expect(updateDayInternal(transaction, {
			id: 1,
			month: 1,
		})).rejects.toBeInstanceOf(Error);

		await expect(updateDayInternal(transaction, {
			id: 1,
			day: 3,
		})).rejects.toBeInstanceOf(Error);
	});
});
