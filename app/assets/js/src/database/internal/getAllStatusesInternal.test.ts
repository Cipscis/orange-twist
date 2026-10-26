import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { insertTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { defaultStatuses } from '../migration';
import { ObjectStoreName } from '../metadata';

import { getAllStatusesInternal } from './getAllStatusesInternal';

describe('getAllStatusesInternal', () => {
	beforeEach(() => insertTestData());

	test('returns all statuses', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS, 'readonly');

		const statuses = await getAllStatusesInternal(transaction);

		expect(statuses).toEqual(defaultStatuses);
	});
});
