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
		const writeTaskOS = writeTransaction.objectStore(ObjectStoreName.TASK);
		const writeStatusOS = writeTransaction.objectStore(ObjectStoreName.STATUS);

		const writeResult = await addTaskInternal(writeTaskOS, writeStatusOS, {
			name: 'Test task',
			note: 'Test task note',
			status: 1,
			sortIndex: 0,
		});

		expect(writeResult).toBe(3);

		const readTransaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readonly');
		const readTaskOS = readTransaction.objectStore(ObjectStoreName.TASK);

		const readResult = await getTaskInternal(readTaskOS, 3);

		expect(readResult).toEqual({
			id: 3,
			name: 'Test task',
			note: 'Test task note',
			status: 1,
			sortIndex: 0,
		});
	});

	test('throws an error if a task is given a non-existent status', async () => {
		const db = await getDatabase();
		const transaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.STATUS,
		], 'readwrite');
		const taskOS = transaction.objectStore(ObjectStoreName.TASK);
		const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

		await expect(
			() => addTaskInternal(taskOS, statusOS, {
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
		const taskOS = transaction.objectStore(ObjectStoreName.TASK);
		const statusOS = transaction.objectStore(ObjectStoreName.STATUS);

		// Add a task first
		await addTaskInternal(taskOS, statusOS, {
			id: 3,
			name: 'Test task',
			note: 'Test task note',
			status: 1,
			sortIndex: 1,
		});

		// Then try adding it again
		await expect(
			() => addTaskInternal(taskOS, statusOS, {
				id: 3,
				name: 'Test task',
				note: 'Test task note',
				status: 1,
				sortIndex: 1,
			})
		).rejects.toBeInstanceOf(Error);
	});
});
