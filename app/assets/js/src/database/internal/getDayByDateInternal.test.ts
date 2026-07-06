import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getDayByDateInternal } from './getDayByDateInternal';

describe('getDayByDateInternal', () => {
	beforeAll(() => createTestData());

	test('receives a day by its date', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');

		const result = await getDayByDateInternal(transaction, {
			year: 2026,
			month: 4,
			day: 26,
		});

		expect(result).toEqual({
			id: 1,
			year: 2026,
			month: 4,
			day: 26,
			note: 'Test note 1',
		} satisfies Awaited<ReturnType<typeof getDayByDateInternal>>);
	});

	test('returns null if no such day exists', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');

		const result = await getDayByDateInternal(transaction, {
			year: 2020,
			month: 1,
			day: 1,
		});

		expect(result).toBeNull();
	});
});
