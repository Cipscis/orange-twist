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
			ObjectStoreName.STATUS,
		], 'readwrite');
	});

	test('updates a specified task', async () => {
		const result = await updateTaskInternal(transaction, {
			id: 2,
			name: 'Updated name',
			status: 3,
		});

		expect(result).toBeUndefined();

		const updatedTask = await getTaskInternal(transaction, 2);

		expect(updatedTask).toEqual({
			id: 2,
			name: 'Updated name',
			note: 'Test task 2 note',
			status: 3,
			sortIndex: 2,
		} satisfies Awaited<ReturnType<typeof getTaskInternal>>);
	});

	test('throws an error if the task doesn\'t exist', async () => {
		await expect(updateTaskInternal(transaction, {
			id: -1,
			name: 'Updated name',
		})).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if the task is given a status that doesn\'t exist', async () => {
		await expect(updateTaskInternal(transaction, {
			id: 1,
			status: -1,
		})).rejects.toBeInstanceOf(Error);
	});
});
