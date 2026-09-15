import {
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { Day } from '../types';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { insertTestData } from '../test-utils';

import { getDayInternal } from './getDayInternal';

describe('getDayInternal', () => {
	let transaction: IDBTransaction;

	beforeAll(() => insertTestData());

	beforeEach(async () => {
		const db = await getDatabase();
		transaction = db.transaction(ObjectStoreName.DAY, 'readonly');
	});

	test('returns the specified day', async () => {
		const day = await getDayInternal(transaction, 1);

		expect(day).toEqual({
			id: 1,
			year: 2026,
			month: 4,
			day: 26,
			note: 'Test note 1',
		} satisfies Day);
	});

	test('returns null if no day exists for that ID', async () => {
		const day = await getDayInternal(transaction, -1);

		expect(day).toBeNull();
	});
});
