import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from 'database/test-utils';

import { getDaysInternal } from './getDaysInternal';
import { ObjectStoreName } from 'database/metadata';
import { getDatabase } from 'utils/indexedDB';

describe('getDaysInternal', () => {
	beforeAll(() => createTestData());

	test('returns all days', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY, 'readonly');
		const dayOS = transaction.objectStore(ObjectStoreName.DAY);

		const days = await getDaysInternal(dayOS);

		expect(days).toEqual([
			{
				id: 0,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 2',
			},
		]);
	});
});
