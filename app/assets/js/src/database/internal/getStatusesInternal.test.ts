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

import { getStatusesInternal } from './getStatusesInternal';

describe('getStatusesInternal', () => {
	beforeEach(() => insertTestData());

	test('returns all statuses', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS, 'readonly');

		const statuses = await getStatusesInternal(transaction);

		expect(statuses).toEqual(defaultStatuses);
	});
});
