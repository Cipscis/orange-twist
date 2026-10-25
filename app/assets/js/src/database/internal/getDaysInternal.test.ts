import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import type { Day } from '../types';
import { getDatabase } from '../utils';
import { insertTestData } from '../test-utils';
import { ObjectStoreName } from '../metadata';

import { getDaysInternal } from './getDaysInternal';

describe('getDaysInternal', () => {
	beforeAll(() => insertTestData());

	test('returns days for the provided IDs in order', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');

		const tasks = await getDaysInternal(transaction, [2, 1, -1, 2]);

		expect(tasks).toEqual([
			{
				id: 2,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 2',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 1',
			},
			null,
			{
				id: 2,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 2',
			},
		] satisfies (Day | null)[]);
	});
});
