import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';
import { ObjectStoreName } from 'database/metadata';
import { createTestData } from 'database/test-utils';
import { getDatabase } from 'database/utils';
import { getStatusByNameInternal } from './getStatusByNameInternal';

describe('getStatusByNameInternal', () => {
	beforeAll(() => createTestData());

	test('returns a status with the specified name', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);
		const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

		const status = await getStatusByNameInternal(statusOS, 'todo');

		expect(status).toEqual({
			id: 0,
			name: 'todo',
			isComplete: false,
		});
	});

	test('returns null if no status exists with that name', async () => {
		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.STATUS);
		const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

		const status = await getStatusByNameInternal(statusOS, 'no status with this name');

		expect(status).toBeNull();
	});
});
