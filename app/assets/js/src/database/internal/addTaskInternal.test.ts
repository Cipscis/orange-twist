import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';

import { getTaskInternal } from './getTaskInternal';

import { addTaskInternal } from './addTaskInternal';

describe('addTaskInternal', () => {
	beforeEach(() => createTestData());

	test('inserts a new task into the database, and returns its ID', async () => {
		const db = await getDatabase();
		const writeTransaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');

		const writeResult = await addTaskInternal(writeTransaction, {
			name: 'Test task',
			note: 'Test task note',
			status: 2,
			sortIndex: 0,
		});

		expect(writeResult).toBe(4);

		const readTransaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readonly');

		const readResult = await getTaskInternal(readTransaction, 4);

		expect(readResult).toEqual({
			id: 4,
			name: 'Test task',
			note: 'Test task note',
			status: 2,
			sortIndex: 0,
		});
	});

	test('throws an error if a task is given a non-existent status', async () => {
		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');

		await expect(
			() => addTaskInternal(transaction, {
				name: 'Test task',
				note: 'Test task note',
				status: -1,
				sortIndex: 1,
			})
		).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if a task already exists with that ID', async () => {
		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');

		// Add a task first
		await addTaskInternal(transaction, {
			id: 4,
			name: 'Test task',
			note: 'Test task note',
			status: 2,
			sortIndex: 1,
		});

		// Then try adding it again
		await expect(
			() => addTaskInternal(transaction, {
				id: 4,
				name: 'Test task',
				note: 'Test task note',
				status: 2,
				sortIndex: 1,
			})
		).rejects.toBeInstanceOf(Error);
	});
});
