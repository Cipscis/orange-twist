import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getStatusesInternal } from './getStatusesInternal';

describe('getStatusesInternal', () => {
	beforeEach(() => createTestData());

	test('returns all statuses', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS, 'readonly');

		const statuses = await getStatusesInternal(transaction);

		expect(statuses).toEqual([
			{
				id: 1,
				alias: 'todo',
				name: 'Todo',
				icon: 'todo.svg',
				colour: 'var(--blue)',
				completed: false,
			},
			{
				id: 2,
				alias: 'in-progress',
				name: 'In progress',
				icon: 'in-progress.svg',
				colour: 'var(--blue)',
				completed: false,
			},
			{
				id: 3,
				alias: 'completed',
				name: 'Completed',
				icon: 'completed.svg',
				colour: 'var(--green)',
				completed: true,
			},
		] satisfies Awaited<ReturnType<typeof getStatusesInternal>>);
	});
});
