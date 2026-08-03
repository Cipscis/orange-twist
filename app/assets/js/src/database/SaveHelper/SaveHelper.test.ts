import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { SaveType } from 'types/SaveAction';

import { createTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	getDayTaskForDayAndTaskInternal,
	getDayTaskInternal,
	getTaskInternal,
} from '../internal';

import { SaveHelper } from './SaveHelper';

describe('SaveHelper', () => {
	let db: IDBDatabase;
	let saveHelper: SaveHelper;

	beforeEach(async () => {
		await createTestData();
		db = await getDatabase();
		saveHelper = new SaveHelper();
	});

	test('saves task notes', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const beforeTask1 = await getTaskInternal(readTransaction, 1);
		const beforeTask2 = await getTaskInternal(readTransaction, 2);

		expect(beforeTask1?.note).toBe('Test task 1 note');
		expect(beforeTask2?.note).toBe('Test task 2 note');

		await saveHelper.save([
			{
				type: SaveType.TASK_NOTE,
				task: 1,
				note: 'New note 1',
			},
			{
				type: SaveType.TASK_NOTE,
				task: 2,
				note: 'New note 2',
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const afterTask1 = await getTaskInternal(readTransaction, 1);
		const afterTask2 = await getTaskInternal(readTransaction, 2);

		expect(afterTask1?.note).toBe('New note 1');
		expect(afterTask2?.note).toBe('New note 2');
	});

	test('saves day task notes via legacy interface', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const beforeDayTask1 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 1 });
		const beforeDayTask2 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 2 });

		expect(beforeDayTask1?.note).toBe('Note for task 1 day 1');
		expect(beforeDayTask2?.note).toBe('Note for task 2 day 1');

		await saveHelper.save([
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

		await saveHelper.save([
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
