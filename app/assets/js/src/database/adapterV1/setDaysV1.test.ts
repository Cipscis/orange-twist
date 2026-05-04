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
import { getDayTasksInternal } from '../internal';

import { getDays } from '../getDays';

import { setDaysV1 } from './setDaysV1';

describe('setDaysV1', () => {
	beforeEach(() => createTestData());

	test('adds new days', async () => {
		// Start from a blank slate - remove all days and day tasks
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
				tasks: [1, 0],
			}],
			['2020-01-02', {
				name: '2020-01-02',
				note: '2020-01-02 note',
				tasks: [2, 1],
			}],
		]);

		const days = await getDays();
		// IDs don't start at 0 because the database had data entered before it was cleared
		expect(days).toEqual([
			{
				id: 3,
				year: 2020,
				month: 1,
				day: 1,
				note: '2020-01-01 note',
			},
			{
				id: 4,
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
				tasks: [1, 0],
			}],
			['2020-01-02', {
				name: '2020-01-02',
				note: '2020-01-02 note',
				tasks: [2, 1],
			}],
		]);

		const readTransaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTasksOS = readTransaction.objectStore(ObjectStoreName.DAY_TASK);
		const dayTasks = await getDayTasksInternal(dayTasksOS);
		// IDs don't start at 0 because the database had data entered before it was cleared
		expect(dayTasks).toEqual([
			{
				id: 2,
				day: 3,
				task: 1,
				note: '',
				summary: null,
				sortIndex: 0,
				status: 1,
			},
			{
				id: 4,
				day: 4,
				task: 2,
				note: '',
				summary: null,
				sortIndex: 0,
				status: 1,
			},
			{
				id: 3,
				day: 3,
				task: 0,
				note: '',
				summary: null,
				sortIndex: 1,
				status: 1,
			},
			{
				id: 5,
				day: 4,
				task: 1,
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
				note: 'Test note 0 updated',
				tasks: [1, 0],
			}],
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 1 updated',
				tasks: [],
			}],
			['2026-01-01', {
				name: '2026-01-01',
				note: 'Test note 2 updated',
				tasks: [],
			}],
		]);

		const days = await getDays();
		expect(days).toEqual([
			{
				id: 2,
				year: 2026,
				month: 1,
				day: 1,
				note: 'Test note 2 updated',
			},
			{
				id: 0,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test note 0 updated',
			},
			{
				id: 1,
				year: 2026,
				month: 4,
				day: 27,
				note: 'Test note 1 updated',
			},
		]);
	});

	test('updates exists days\' day tasks', async () => {
		await setDaysV1([
			['2026-04-26', {
				name: '2026-04-26',
				note: 'Test note 0 updated',
				tasks: [],
			}],
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 1 updated',
				tasks: [1, 0],
			}],
			['2026-01-01', {
				name: '2026-01-01',
				note: 'Test note 2 updated',
				tasks: [0, 2],
			}],
		]);

		const db = await getDatabase();
		const readTransaction = db.transaction(ObjectStoreName.DAY_TASK, 'readonly');
		const dayTasksOS = readTransaction.objectStore(ObjectStoreName.DAY_TASK);
		const dayTasks = await getDayTasksInternal(dayTasksOS);
		expect(dayTasks).toEqual([
			{
				id: 2,
				day: 1,
				task: 1,
				note: '',
				summary: null,
				status: 1,
				sortIndex: 0,
			},
			{
				id: 4,
				day: 2,
				task: 0,
				note: '',
				summary: null,
				status: 1,
				sortIndex: 0,
			},
			{
				id: 3,
				day: 1,
				task: 0,
				note: '',
				summary: null,
				status: 1,
				sortIndex: 1,
			},
			{
				id: 5,
				day: 2,
				task: 2,
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
				note: 'Test note 0',
				tasks: [-1],
			}],
			['2026-04-27', {
				name: '2026-04-27',
				note: 'Test note 1',
				tasks: [],
			}],
			['2026-01-01', {
				name: '2026-01-01',
				note: 'Test note 2',
				tasks: [],
			}],
		]);

		await expect(promise).rejects.toBeInstanceOf(Error);
	});

	test.todo('removes removed days');

	test.todo('removes existing days\' day tasks');
});
