import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ObjectStoreName } from '../metadata';
import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';

import { getTaskInternal } from './getTaskInternal';

import { updateTaskInternal } from './updateTaskInternal';

describe('updateTaskInternal', () => {
	let transaction: IDBTransaction;

	beforeEach(async () => {
		await createTestData();

		const db = await getDatabase();
		transaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readwrite');
	});

	test('updates a specified task', async () => {
		const result = await updateTaskInternal(transaction, {
			id: 2,
			name: 'Updated name',
		});

		expect(result).toBeUndefined();

		const updatedTask = await getTaskInternal(transaction, 2);

		expect(updatedTask).toEqual({
			id: 2,
			name: 'Updated name',
			note: 'Test task 2 note',
			sortIndex: 2,
		} satisfies Awaited<ReturnType<typeof getTaskInternal>>);
	});

	test('throws an error if the task doesn\'t exist', async () => {
		await expect(updateTaskInternal(transaction, {
			id: -1,
			name: 'Updated name',
		})).rejects.toBeInstanceOf(Error);
	});
});
