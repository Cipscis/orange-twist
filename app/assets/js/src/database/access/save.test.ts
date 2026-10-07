import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import type {
	Day,
	DayTask,
	Task,
} from '../types';
import { insertTestData } from '../test-utils';
import { getDatabase } from '../utils';
import { ObjectStoreName } from '../metadata';
import {
	getDayByDateInternal,
	getDayInternal,
	getDayTaskForDayAndTaskInternal,
	getDayTaskInternal,
	getDayTasksForTaskInternal,
	getTaskInternal,
} from '../internal';

import { type SaveAction, SaveType } from './SaveAction';

import { save } from './save';

describe('SaveHelper', () => {
	let db: IDBDatabase;

	beforeEach(async () => {
		await insertTestData();
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

	describe('sets tasks\' statuses for a given day', () => {
		beforeEach(async () => {
			await insertTestData({
				day: {
					3: {
						id: 3,
						year: 2026,
						month: 10,
						day: 7,
						note: '',
					},
				},
				day_task: {
					3: {
						id: 3,
						day: 3,
						task: 2,
						status: 1,
						summary: null,
						note: '',
						sortIndex: null,
					},
				},
			});
			db = await getDatabase();
		});

		test('when the given day does not exist', async () => {
			await save([{
				type: SaveType.TASK_STATUS_FOR_DATE,
				id: 1,
				status: 3,
				day: { year: 2026, month: 10, day: 6 },
			}]);

			const readTransaction = db.transaction([
				ObjectStoreName.DAY,
				ObjectStoreName.DAY_TASK,
			], 'readonly');

			const afterDay = await getDayByDateInternal(readTransaction, { year: 2026, month: 10, day: 6 });

			expect(afterDay).toEqual({
				id: 4,
				year: 2026,
				month: 10,
				day: 6,
				note: '',
			} satisfies Day);

			const afterDayTask = await getDayTaskForDayAndTaskInternal(readTransaction, { day: afterDay!.id, task: 1 });

			expect(afterDayTask).toMatchObject({
				id: 4,
				day: 4,
				task: 1,
				status: 3,
			} satisfies Pick<DayTask, 'id' | 'day' | 'task' | 'status'>);
		});

		test('when the given day does exist and a day task for the given day does not exist', async () => {
			await save([{
				type: SaveType.TASK_STATUS_FOR_DATE,
				id: 1,
				status: 3,
				day: { year: 2026, month: 10, day: 7 },
			}]);

			const readTransaction = db.transaction([
				ObjectStoreName.DAY_TASK,
			], 'readonly');

			const afterDayTask = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 3, task: 1 });

			expect(afterDayTask).toMatchObject({
				id: 4,
				day: 3,
				task: 1,
				status: 3,
			} satisfies Pick<DayTask, 'id' | 'day' | 'task' | 'status'>);
		});

		test('when the given day does exist and a day task for the given day does exist', async () => {
			await save([{
				type: SaveType.TASK_STATUS_FOR_DATE,
				id: 2,
				status: 3,
				day: { year: 2026, month: 10, day: 7 },
			}]);

			const readTransaction = db.transaction([
				ObjectStoreName.DAY_TASK,
			], 'readonly');

			const afterDayTask = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 3, task: 2 });

			expect(afterDayTask).toMatchObject({
				id: 3,
				day: 3,
				task: 2,
				status: 3,
			} satisfies Pick<DayTask, 'id' | 'day' | 'task' | 'status'>);
		});
	});

	test('sets tasks\' statuses for today', async () => {
		await insertTestData({
			day: {
				3: {
					id: 3,
					year: 2026,
					month: 10,
					day: 7,
					note: '',
				},
			},
			day_task: {
				3: {
					id: 3,
					day: 3,
					task: 2,
					status: 1,
					summary: null,
					note: '',
					sortIndex: null,
				},
			},
		});
		db = await getDatabase();

		jest.useFakeTimers({
			advanceTimers: true,
		}).setSystemTime(
			new Date(2026, 9, 6, 8)
		);

		await save([{
			type: SaveType.TASK_STATUS,
			id: 1,
			status: 3,
		}]);

		const readTransaction = db.transaction([
			ObjectStoreName.DAY,
			ObjectStoreName.DAY_TASK,
		], 'readonly');

		const afterDay = await getDayByDateInternal(readTransaction, { year: 2026, month: 10, day: 6 });

		expect(afterDay).toEqual({
			id: 4,
			year: 2026,
			month: 10,
			day: 6,
			note: '',
		} satisfies Day);

		const afterDayTask = await getDayTaskForDayAndTaskInternal(readTransaction, { day: afterDay!.id, task: 1 });

		expect(afterDayTask).toMatchObject({
			id: 4,
			day: 4,
			task: 1,
			status: 3,
		} satisfies Pick<DayTask, 'id' | 'day' | 'task' | 'status'>);

		jest.useRealTimers();
	});

	test('adds tasks', async () => {
		await save([
			{
				type: SaveType.TASK_ADD,
				task: {
					name: 'New task',
					note: 'New note',
					sortIndex: 0,
				},
			},
		]);

		const readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const task = await getTaskInternal(readTransaction, 4);

		expect(task).toEqual({
			id: 4,
			name: 'New task',
			note: 'New note',
			sortIndex: 0,
		});
	});

	test('adds a new task and creates a day task for it', async () => {
		await save([
			{
				type: SaveType.TASK_ADD_WITH_DAY,
				task: {
					name: 'New task',
					note: 'New note',
					sortIndex: 0,
				},
				dayId: 1,
			},
		]);

		const readTransaction = db.transaction([
			ObjectStoreName.TASK,
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const task = await getTaskInternal(readTransaction, 4);

		expect(task).toEqual({
			id: 4,
			name: 'New task',
			note: 'New note',
			sortIndex: 0,
		} satisfies Task);

		const dayTask = await getDayTaskForDayAndTaskInternal(readTransaction, { day: 1, task: 4 });

		expect(dayTask).toEqual({
			id: 3,
			day: 1,
			task: 4,
			status: 1,
			note: '',
			summary: null,
			sortIndex: -3,
		} satisfies DayTask);
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

	test('deletes tasks, and all associated day tasks', async () => {
		let readTransaction = db.transaction([
			ObjectStoreName.TASK,
		], 'readonly');
		const beforeTask1 = await getTaskInternal(readTransaction, 1);

		expect(beforeTask1).toEqual({
			id: 1,
			name: 'Test task 1',
			note: 'Test task 1 note',
			sortIndex: 1,
		});

		await save([
			{
				type: SaveType.TASK_DELETE,
				id: 1,
			},
		]);

		readTransaction = db.transaction([
			ObjectStoreName.DAY,
			ObjectStoreName.TASK,
			ObjectStoreName.DAY_TASK,
		], 'readonly');
		const afterTask1 = await getTaskInternal(readTransaction, 1);
		const afterDayTasks = await getDayTasksForTaskInternal(readTransaction, 1);

		expect(afterTask1).toEqual(null);
		expect(afterDayTasks).toEqual([]);
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
					Extract<SaveAction, { type: typeof SaveType.DAY; }>['day']
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
