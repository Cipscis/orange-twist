import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDatabase } from '../utils';
import { insertTestData } from '../test-utils';
import { ObjectStoreName } from '../metadata';

import { getAllTaskIdsInternal } from './getAllTaskIdsInternal';

describe('getAllTaskIdsInternal', () => {
	beforeAll(() => insertTestData());

	test('returns all task IDs', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.TASK, 'readonly');

		const tasks = await getAllTaskIdsInternal(transaction);

		expect(tasks).toEqual([1, 2, 3] satisfies number[]);
	});
});
