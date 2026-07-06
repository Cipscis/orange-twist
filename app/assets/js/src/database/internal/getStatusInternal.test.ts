import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { getDatabase } from '../utils';
import { createTestData } from '../test-utils';

import { getStatusInternal } from './getStatusInternal';

describe('getStatusInternal', () => {
	beforeAll(() => createTestData());

	test('returns a status with the specified status ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);

		const status = await getStatusInternal(transaction, 1);

		expect(status).toEqual({
			id: 1,
			alias: 'todo',
		} satisfies Awaited<ReturnType<typeof getStatusInternal>>);
	});

	test('returns null if no status exists by that status ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);

		const status = await getStatusInternal(transaction, -1);

		expect(status).toBeNull();
	});
});
