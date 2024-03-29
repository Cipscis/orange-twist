import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { TaskStatus } from 'types/TaskStatus';

import { updateOldTaskInfo } from './updateOldTaskInfo';

describe('updateOldTaskInfo', () => {
	test('throws an error if passed unrecognised data', () => {
		expect(() => {
			updateOldTaskInfo('invalid data');
		}).toThrow();
	});

	test('correctly migrates task data from schema version 1', () => {
		const result = updateOldTaskInfo({
			id: 1,
			name: 'Task name',
			status: TaskStatus.IN_PROGRESS,
		});

		expect(result).toEqual({
			id: 1,
			name: 'Task name',
			status: TaskStatus.IN_PROGRESS,
			note: '',
			sortIndex: -1,
		});
	});

	test('correctly migrates task data from schema version 2', () => {
		const result = updateOldTaskInfo({
			id: 1,
			name: 'Task name',
			status: TaskStatus.IN_PROGRESS,
			note: 'Task note',
		});

		expect(result).toEqual({
			id: 1,
			name: 'Task name',
			status: TaskStatus.IN_PROGRESS,
			note: 'Task note',
			sortIndex: -1,
		});
	});
});
