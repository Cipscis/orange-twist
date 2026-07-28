import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';


import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	getDayTaskForDayAndTaskInternal,
	getDayTaskInternal,
	getTaskInternal,
} from '../internal';

import { SaveType } from './SaveAction';

import { save } from './save';
import type { DatabaseData } from 'database/types';

describe('SaveHelper', () => {
	let db: IDBDatabase;

	beforeEach(async () => {
		await createTestData();
		db = await getDatabase();
	});

	test('saves tasks', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const beforeTask1 = await getTaskInternal(readTransaction, 1);
		const beforeTask2 = await getTaskInternal(readTransaction, 2);

		expect(beforeTask1?.note).toBe('Test task 1 note');
		expect(beforeTask2?.note).toBe('Test task 2 note');

		await save([
			{
				type: SaveType.TASK,
				id: 1,
				// Ensure undefined and extraneous properties are ignored
				task: {
					name: undefined,
					note: 'New note 1',
					// @ts-expect-error Ignore for test
					extra: 'test',
				},
			},
			{
				type: SaveType.TASK,
				id: 2,
				// Ensure all properties get updated
				task: {
					name: 'Test task 2 updated',
					note: 'New note 2',
					sortIndex: 3,
					status: 3,
				} satisfies Omit<
					DatabaseData[typeof ObjectStoreName.TASK][number],
					'id'
				>,
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const afterTask1 = await getTaskInternal(readTransaction, 1);
		const afterTask2 = await getTaskInternal(readTransaction, 2);

		expect(afterTask1).toEqual({
			id: 1,
			name: 'Test task 1',
			note: 'New note 1',
			sortIndex: 1,
			status: 1,
		});
		expect(afterTask2).toEqual({
			id: 2,
			name: 'Test task 2 updated',
			note: 'New note 2',
			sortIndex: 3,
			status: 3,
		});
	});

	test('saves day task notes via legacy interface', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const beforeDayTask1 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 1 });
		const beforeDayTask2 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 2 });

		expect(beforeDayTask1?.note).toBe('Note for task 1 day 1');
		expect(beforeDayTask2?.note).toBe('Note for task 2 day 1');

		await save([
			{
				type: SaveType.DAY_TASK_NOTE_LEGACY,
				dayName: '2026-04-26',
				taskId: 1,
				note: 'New note 1',
			},
			{
				type: SaveType.DAY_TASK_NOTE_LEGACY,
				dayName: '2026-04-26',
				taskId: 2,
				note: 'New note 2',
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const afterDayTask1 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 1 });
		const afterDayTask2 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 2 });

		expect(afterDayTask1?.note).toBe('New note 1');
		expect(afterDayTask2?.note).toBe('New note 2');
	});

	test('saves day task notes', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const beforeDayTask1 = await getDayTaskInternal(readTransaction, 1);
		const beforeDayTask2 = await getDayTaskInternal(readTransaction, 2);

		expect(beforeDayTask1?.note).toBe('Note for task 1 day 1');
		expect(beforeDayTask2?.note).toBe('Note for task 2 day 1');

		await save([
			{
				type: SaveType.DAY_TASK_NOTE,
				dayTask: 1,
				note: 'New note 1',
			},
			{
				type: SaveType.DAY_TASK_NOTE,
				dayTask: 2,
				note: 'New note 2',
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const afterDayTask1 = await getDayTaskInternal(readTransaction, 1);
		const afterDayTask2 = await getDayTaskInternal(readTransaction, 2);

		expect(afterDayTask1?.note).toBe('New note 1');
		expect(afterDayTask2?.note).toBe('New note 2');
	});
});
