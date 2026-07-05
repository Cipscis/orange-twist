import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getIdbRequestPromise } from 'utils';

import { getDatabase } from '../utils';
import { createTestData } from '../test-utils';
import { ObjectStoreName } from '../metadata';
import { getDaysInternal, getDayTasksInternal } from '../internal';

import { setDaysV1 } from './setDaysV1';

describe('setDaysV1', () => {
	beforeEach(() => createTestData());

	test('adds new days', async () => {
		// Start from a blank slate - remove all days
		const db = await getDatabase();
		const writeTransaction = db.transaction(
			[ObjectStoreName.DAY],
			'readwrite'
		);
		const writeDayOS = writeTransaction.objectStore(ObjectStoreName.DAY);
		await getIdbRequestPromise(writeDayOS.clear());

		// Set days
		await setDaysV1([
			['2020-01-01', {
				name: '2020-01-01',
				note: '2020-01-01 note',
				tasks: [2, 1],
			}],
			['2020-01-02', {
				name: '2020-01-02',
				note: '2020-01-02 note',
				tasks: [3, 1],
			}],
		]);

		const readTransaction = db.transaction(ObjectStoreName.DAY, 'readonly');
		const days = await getDaysInternal(readTransaction);
		// IDs don't start at 1 because the database had data entered before it was cleared
		expect(days).toEqual([
			{
				id: 4,
				year: 2020,
				month: 1,
				day: 1,
				note: '2020-01-01 note',
			},
			{
				id: 5,
				year: 2020,
				month: 1,
				day: 2,
				note: '2020-01-02 note',
			},
		]);
	});

	test('adds day tasks for new days', async () => {
		// Start from a blank slate - remove all days and day tasks
		const db = await getDatabase();
		const writeTransaction = db.transaction(
			[ObjectStoreName.DAY, ObjectStoreName.DAY_TASK],
			'readwrite'
		);
		const writeDayOS = writeTransaction.objectStore(ObjectStoreName.DAY);
		const writeDayTaskOS = writeTransaction.objectStore(ObjectStoreName.DAY_TASK);
		await Promise.all([
			getIdbRequestPromise(writeDayOS.clear()),
			getIdbRequestPromise(writeDayTaskOS.clear()),
		]);

		// Set days
		await setDaysV1([
			['2020-01-01', {
				name: '2020-01-01',
				note: '2020-01-01 note',
				tasks: [2, 1],
			}],
			['2020-01-02', {
				name: '2020-01-02',
				note: '2020-01-02 note',
				tasks: [3, 2],
			}],
		]);

		const readTransaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTasks = await getDayTasksInternal(readTransaction);
		// IDs don't start at 1 because the database had data entered before it was cleared
		expect(dayTasks).toEqual([
			{
				id: 3,
				day: 4,
				task: 2,
				note: '',
				summary: null,
				sortIndex: 0,
				status: 1,
			},
			{
				id: 5,
				day: 5,
				task: 3,
				note: '',
				summary: null,
				sortIndex: 0,
				status: 1,
			},
			{
				id: 4,
				day: 4,
				task: 1,
				note: '',
				summary: null,
				sortIndex: 1,
				status: 1,
			},
			{
				id: 6,
				day: 5,
				task: 2,
				note: '',
				summary: null,
				sortIndex: 1,
				status: 1,
			},
		]);
	});

	test('updates existing days', async () => {
		await setDaysV1([
			['2026-04-26', {
				name: '2026-04-26',
				note: 'Test note 1 updated',
				tasks: [2, 1],
			}],
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 2 updated',
				tasks: [],
			}],
			['2026-01-01', {
				name: '2026-01-01',
				note: 'Test note 3 updated',
				tasks: [],
			}],
		]);

		const db = await getDatabase();
		const readTransaction = db.transaction(ObjectStoreName.DAY, 'readonly');
		const days = await getDaysInternal(readTransaction);
		expect(days).toEqual([
			{
				id: 3,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 3 updated',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 1 updated',
			},
			{
				id: 2,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 2 updated',
			},
		]);
	});

	test('updates existing days\' day tasks', async () => {
		await setDaysV1([
			['2026-04-26', {
				name: '2026-04-26',
				note: 'Test note 1 updated',
				tasks: [],
			}],
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 2 updated',
				tasks: [2, 1],
			}],
			['2026-01-01', {
				name: '2026-01-01',
				note: 'Test note 3 updated',
				tasks: [1, 3],
			}],
		]);

		const db = await getDatabase();
		const readTransaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTasks = await getDayTasksInternal(readTransaction);
		expect(dayTasks).toEqual([
			{
				id: 3,
				day: 2,
				task: 2,
				note: '',
				summary: null,
				status: 1,
				sortIndex: 0,
			},
			{
				id: 5,
				day: 3,
				task: 1,
				note: '',
				summary: null,
				status: 1,
				sortIndex: 0,
			},
			{
				id: 4,
				day: 2,
				task: 1,
				note: '',
				summary: null,
				status: 1,
				sortIndex: 1,
			},
			{
				id: 6,
				day: 3,
				task: 3,
				note: '',
				summary: null,
				status: 1,
				sortIndex: 1,
			},
		]);
	});

	test('throws an error if a day is given a non-existent task', async () => {
		const promise = setDaysV1([
			['2026-04-26', {
				name: '2026-04-26',
				note: 'Test note 1',
				tasks: [-1],
			}],
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 2',
				tasks: [],
			}],
			['2026-01-01', {
				name: '2026-01-01',
				note: 'Test note 3',
				tasks: [],
			}],
		]);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test('removes removed days', async () => {
		await setDaysV1([]);

		const db = await getDatabase();
		const readTransaction = db.transaction(ObjectStoreName.DAY, 'readonly');
		const days = await getDaysInternal(readTransaction);
		expect(days).toEqual([]);
	});

	test('removes existing days\' day tasks', async () => {
		await setDaysV1([
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 2',
				tasks: [],
			}],
		]);

		const db = await getDatabase();
		const readTransaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTasks = await getDayTasksInternal(readTransaction);
		expect(dayTasks).toEqual([]);
	});
});
