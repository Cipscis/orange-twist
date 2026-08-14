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
	getDayByDateInternal,
	getDayInternal,
	getDayTaskForDayAndTaskInternal,
	getDayTaskInternal,
	getTaskInternal,
} from '../internal';

import { type SaveAction, SaveType } from './SaveAction';

import { save } from './save';

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

		expect(beforeTask1).toEqual({
			id: 1,
			name: 'Test task 1',
			note: 'Test task 1 note',
			sortIndex: 1,
		});
		expect(beforeTask2).toEqual({
			id: 2,
			name: 'Test task 2',
			note: 'Test task 2 note',
			sortIndex: 2,
		});

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
				} satisfies Required<
					Extract<SaveAction, { type: typeof SaveType.TASK; }>['task']
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
		});
		expect(afterTask2).toEqual({
			id: 2,
			name: 'Test task 2 updated',
			note: 'New note 2',
			sortIndex: 3,
		});
	});

	test('saves day tasks via legacy interface', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const beforeDayTask1 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 1 });
		const beforeDayTask2 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 2 });

		expect(beforeDayTask1).toEqual({
			id: 1,
			day: 1,
			task: 1,
			note: 'Note for task 1 day 1',
			sortIndex: 1,
			status: 2,
			summary: 'Summary for task 1 day 1',
		});
		expect(beforeDayTask2).toEqual({
			id: 2,
			day: 1,
			task: 2,
			note: 'Note for task 2 day 1',
			sortIndex: 0,
			status: 2,
			summary: 'Summary for task 2 day 1',
		});

		await save([
			{
				type: SaveType.DAY_TASK_LEGACY,
				dayName: '2026-04-26',
				taskId: 1,
				// Ensure undefined and extraneous properties are ignored
				dayTask: {
					status: undefined,
					note: 'New note 1',
					// @ts-expect-error Ignore for test
					extra: 'test',
				},
			},
			{
				type: SaveType.DAY_TASK_LEGACY,
				dayName: '2026-04-26',
				taskId: 2,
				// Ensure all properties get updated
				dayTask: {
					note: 'New note 2',
					sortIndex: 3,
					status: 3,
					summary: 'Test day task 2 updated',
				} satisfies Required<
					Extract<SaveAction, { type: typeof SaveType.DAY_TASK_LEGACY; }>['dayTask']
				>,
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const afterDayTask1 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 1 });
		const afterDayTask2 = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 2 });

		expect(afterDayTask1).toEqual({
			id: 1,
			day: 1,
			task: 1,
			note: 'New note 1',
			status: 2,
			sortIndex: 1,
			summary: 'Summary for task 1 day 1',
		});
		expect(afterDayTask2).toEqual({
			id: 2,
			day: 1,
			task: 2,
			note: 'New note 2',
			sortIndex: 3,
			status: 3,
			summary: 'Test day task 2 updated',
		});
	});

	test('saves day tasks', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const beforeDayTask1 = await getDayTaskInternal(readTransaction, 1);
		const beforeDayTask2 = await getDayTaskInternal(readTransaction, 2);

		expect(beforeDayTask1?.note).toBe('Note for task 1 day 1');
		expect(beforeDayTask2?.note).toBe('Note for task 2 day 1');

		await save([
			{
				type: SaveType.DAY_TASK,
				id: 1,
				// Ensure undefined and extraneous properties are ignored
				dayTask: {
					status: undefined,
					note: 'New note 1',
					// @ts-expect-error Ignore for test
					extra: 'test',
				},
			},
			{
				type: SaveType.DAY_TASK,
				id: 2,
				// Ensure all properties get updated
				dayTask: {
					note: 'New note 2',
					sortIndex: 3,
					status: 3,
					summary: 'Test day task 2 updated',
				} satisfies Required<
					Extract<SaveAction, { type: typeof SaveType.DAY_TASK; }>['dayTask']
				>,
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const afterDayTask1 = await getDayTaskInternal(readTransaction, 1);
		const afterDayTask2 = await getDayTaskInternal(readTransaction, 2);

		expect(afterDayTask1).toEqual({
			id: 1,
			day: 1,
			task: 1,
			note: 'New note 1',
			status: 2,
			sortIndex: 1,
			summary: 'Summary for task 1 day 1',
		});
		expect(afterDayTask2).toEqual({
			id: 2,
			day: 1,
			task: 2,
			note: 'New note 2',
			sortIndex: 3,
			status: 3,
			summary: 'Test day task 2 updated',
		});
	});

	test('saves days via legacy interface', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.DAY,
		], 'readonly');
		const beforeDay1 = await getDayByDateInternal(readTransaction, { year: 2026, month: 4, day: 26 });
		const beforeDay2 = await getDayByDateInternal(readTransaction, { year: 2026, month: 4, day: 27 });

		expect(beforeDay1).toEqual({
			id: 1,
			year: 2026,
			month: 4,
			day: 26,
			note: 'Test note 1',
		});
		expect(beforeDay2).toEqual({
			id: 2,
			year: 2026,
			month: 4,
			day: 27,
			note: 'Test note 2',
		});

		await save([
			{
				type: SaveType.DAY_LEGACY,
				dayName: '2026-04-26',
				// Ensure undefined and extraneous properties are ignored
				day: {
					note: 'New note 1',
					// @ts-expect-error Ignore for test
					extra: 'test',
				},
			},
			{
				type: SaveType.DAY_LEGACY,
				dayName: '2026-04-27',
				// Ensure all properties get updated
				day: {
					note: 'New note 2',
				} satisfies Required<
					Extract<SaveAction, { type: typeof SaveType.DAY_LEGACY; }>['day']
				>,
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.DAY,
		], 'readonly');
		const afterDay1 = await getDayByDateInternal(readTransaction, { year: 2026, month: 4, day: 26 });
		const afterDay2 = await getDayByDateInternal(readTransaction, { year: 2026, month: 4, day: 27 });

		expect(afterDay1).toEqual({
			id: 1,
			year: 2026,
			month: 4,
			day: 26,
			note: 'New note 1',
		});
		expect(afterDay2).toEqual({
			id: 2,
			year: 2026,
			month: 4,
			day: 27,
			note: 'New note 2',
		});
	});

	test('saves days', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.DAY,
		], 'readonly');
		const beforeDay1 = await getDayInternal(readTransaction, 1);
		const beforeDay2 = await getDayInternal(readTransaction, 2);

		expect(beforeDay1).toEqual({
			id: 1,
			year: 2026,
			month: 4,
			day: 26,
			note: 'Test note 1',
		});
		expect(beforeDay2).toEqual({
			id: 2,
			year: 2026,
			month: 4,
			day: 27,
			note: 'Test note 2',
		});

		await save([
			{
				type: SaveType.DAY,
				id: 1,
				// Ensure undefined and extraneous properties are ignored
				day: {
					note: undefined,
					// @ts-expect-error Ignore for test
					extra: 'test',
				},
			},
			{
				type: SaveType.DAY,
				id: 2,
				// Ensure all properties get updated
				day: {
					note: 'New note 2',
				} satisfies Required<
					Extract<SaveAction, { type: typeof SaveType.DAY_LEGACY; }>['day']
				>,
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.DAY,
		], 'readonly');
		const afterDay1 = await getDayInternal(readTransaction, 1);
		const afterDay2 = await getDayInternal(readTransaction, 2);

		expect(afterDay1).toEqual({
			id: 1,
			year: 2026,
			month: 4,
			day: 26,
			note: 'Test note 1',
		});
		expect(afterDay2).toEqual({
			id: 2,
			year: 2026,
			month: 4,
			day: 27,
			note: 'New note 2',
		});
	});
});
