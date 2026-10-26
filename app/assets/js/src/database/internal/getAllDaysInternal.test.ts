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

import { getAllDaysInternal } from './getAllDaysInternal';

describe('getAllDaysInternal', () => {
	beforeAll(() => insertTestData());

	test('returns all days in chronological order', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');

		const days = await getAllDaysInternal(transaction);

		expect(days).toEqual([
			{
				id: 3,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 3',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 1',
			},
			{
				id: 2,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 2',
			},
		] satisfies Day[]);
	});
});
