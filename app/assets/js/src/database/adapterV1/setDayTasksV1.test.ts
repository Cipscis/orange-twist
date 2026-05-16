import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIdbRequestPromise } from 'utils';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import { getDayTasksInternal } from '../internal';

import { setDayTasksV1 } from './setDayTasksV1';

describe('setDayTasksV1', () => {
	beforeEach(() => createTestData());

	test('adds new day tasks', async () => {
		// Start from a blank slate - remove all day tasks
		const db = await getDatabase();
		const writeTransaction = db.transaction(
			[ObjectStoreName.DAY_TASK],
			'readwrite'
		);
		const writeDayTaskOS = writeTransaction.objectStore(ObjectStoreName.DAY_TASK);
		await getIdbRequestPromise(writeDayTaskOS.clear());

		// Set day tasks
		await setDayTasksV1([
			['2026-04-26_0', {
				dayName: '2026-04-26',
				taskId: 0,
				note: 'Note for 2026-04-26 task 0',
				summary: 'Summary for 2026-04-26 task 0',
				status: 'todo',
			}],
			['2026-04-26_1', {
				dayName: '2026-04-26',
				taskId: 1,
				note: 'Note for 2026-04-26 task 1',
				summary: 'Summary for 2026-04-26 task 1',
				status: 'completed',
			}],
		]);

		const readTransaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const readDayTaskOS = readTransaction.objectStore(ObjectStoreName.DAY_TASK);
		const dayTasks = await getDayTasksInternal(readDayTaskOS);
		// IDs don't start at 0 because the database had data entered before it was cleared
		expect(dayTasks).toEqual([
			{
				id: 2,
				day: 0,
				task: 0,
				note: 'Note for 2026-04-26 task 0',
				summary: 'Summary for 2026-04-26 task 0',
				status: 0,
				sortIndex: null,
			},
			{
				id: 3,
				day: 0,
				task: 1,
				note: 'Note for 2026-04-26 task 1',
				summary: 'Summary for 2026-04-26 task 1',
				status: 2,
				sortIndex: null,
			},
		]);
	});

	test.todo('updates existing day tasks');

	test.todo('throws an error if a day task is given a non-existent day');

	test.todo('throws an error if a day task is given a non-existent task');

	test.todo('throws an error if a day task is given a non-existent status');

	test.todo('removes removed day tasks');
});
