import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getStatusByAliasInternal } from './getStatusByAliasInternal';

describe('getStatusByAliasInternal', () => {
	beforeAll(() => createTestData());

	test('returns a status with the specified name', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);

		const status = await getStatusByAliasInternal(transaction, 'todo');

		expect(status).toEqual({
			id: 1,
			alias: 'todo',
		} satisfies Awaited<ReturnType<typeof getStatusByAliasInternal>>);
	});

	test('returns null if no status exists with that name', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);

		const status = await getStatusByAliasInternal(transaction, 'no status with this name');

		expect(status).toBeNull();
	});
});
