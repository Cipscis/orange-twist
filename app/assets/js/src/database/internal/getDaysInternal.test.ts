import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { createTestData } from '../test-utils';
import { ObjectStoreName } from '../metadata';

import { getDaysInternal } from './getDaysInternal';

describe('getDaysInternal', () => {
	beforeAll(() => createTestData());

	test('returns all days in chronological order', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');

		const days = await getDaysInternal(transaction);

		expect(days).toEqual([
			{
				id: 2,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 2',
			},
			{
				id: 0,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 0',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 1',
			},
		]);
	});
});
