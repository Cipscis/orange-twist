import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { TaskStatus } from 'types/TaskStatus';

import { updateOldDayTaskInfo } from './updateOldDayTaskInfo';

describe('updateOldDayTaskInfo', () => {
	test('throws an error if passed unrecognised data', () => {
		expect(() => {
			updateOldDayTaskInfo('invalid data');
		}).toThrow();
	});

	test('correctly migrates task data from schema version 1', () => {
		const result = updateOldDayTaskInfo({
			dayName: '2024-01-15',
			taskId: 1,
			status: TaskStatus.TODO,
			note: '',
		});

		expect(result).toEqual({
			dayName: '2024-01-15',
			taskId: 1,
			status: TaskStatus.TODO,
			note: '',
			summary: null,
		});
	});
});
