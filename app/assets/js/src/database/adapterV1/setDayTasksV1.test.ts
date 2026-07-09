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
import type { LegacyStatusName } from '../types';

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
			['2026-04-26_1', {
				dayName: '2026-04-26',
				taskId: 1,
				note: 'Note for 2026-04-26 task 1',
				summary: 'Summary for 2026-04-26 task 1',
				status: 'todo',
			}],
			['2026-04-26_2', {
				dayName: '2026-04-26',
				taskId: 2,
				note: 'Note for 2026-04-26 task 2',
				summary: 'Summary for 2026-04-26 task 2',
				status: 'completed',
			}],
		]);

		const readTransaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTasks = await getDayTasksInternal(readTransaction);
		// IDs don't start at 1 because the database had data entered before it was cleared
		expect(dayTasks).toEqual([
			{
				id: 3,
				day: 1,
				task: 1,
				note: 'Note for 2026-04-26 task 1',
				summary: 'Summary for 2026-04-26 task 1',
				status: 1,
				sortIndex: null,
			},
			{
				id: 4,
				day: 1,
				task: 2,
				note: 'Note for 2026-04-26 task 2',
				summary: 'Summary for 2026-04-26 task 2',
				status: 3,
				sortIndex: null,
			},
		] satisfies Awaited<ReturnType<typeof getDayTasksInternal>>);
	});

	test('updates existing day tasks', async () => {
		await setDayTasksV1([
			['2026-04-26_1', {
				dayName: '2026-04-26',
				taskId: 1,
				note: 'Note for task 1 day 1 updated',
				summary: 'Summary for task 1 day 1 updated',
				status: 'completed',
			}],
			['2026-04-26_2', {
				dayName: '2026-04-26',
				taskId: 2,
				note: 'Note for task 2 day 1 updated',
				summary: 'Summary for task 2 day 1 updated',
				status: 'completed',
			}],
		]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTasks = await getDayTasksInternal(transaction);
		expect(dayTasks).toEqual([
			{
				id: 2,
				day: 1,
				task: 2,
				note: 'Note for task 2 day 1 updated',
				summary: 'Summary for task 2 day 1 updated',
				status: 3,
				sortIndex: 0,
			},
			{
				id: 1,
				day: 1,
				task: 1,
				note: 'Note for task 1 day 1 updated',
				summary: 'Summary for task 1 day 1 updated',
				status: 3,
				sortIndex: 1,
			},
		] satisfies Awaited<ReturnType<typeof getDayTasksInternal>>);
	});

	test('throws an error if a day task is given a non-existent day', async () => {
		const promise = setDayTasksV1([
			['2020-04-26_0', {
				dayName: '2020-04-26',
				taskId: 0,
				note: 'Note for task 0 day 0 updated',
				summary: 'Summary for task 0 day 0 updated',
				status: 'completed',
			}],
		]);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if a day task is given a non-existent task', async () => {
		const promise = setDayTasksV1([
			['2026-04-26_-1', {
				dayName: '2026-04-26',
				taskId: -1,
				note: 'Note for task 0 day 0 updated',
				summary: 'Summary for task 0 day 0 updated',
				status: 'completed',
			}],
		]);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('throws an error if a day task is given a non-existent status', async () => {
		const promise = setDayTasksV1([
			['2026-04-26_0', {
				dayName: '2026-04-26',
				taskId: 0,
				note: 'Note for task 0 day 0 updated',
				summary: 'Summary for task 0 day 0 updated',
				status: 'no-status' as LegacyStatusName,
			}],
		]);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('removes removed day tasks', async () => {
		await setDayTasksV1([]);

		const db = await getDatabase();
		const transaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');

		const dayTasks = await getDayTasksInternal(transaction);
		expect(dayTasks).toEqual([]);
	});
});
