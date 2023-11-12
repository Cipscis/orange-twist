import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { setTaskInfo } from './setTaskInfo';
import { getTaskInfo } from './getTaskInfo';

import { deleteTask } from './deleteTask';

describe('deleteTask', () => {
	test('when passed a task ID without any task data, does nothing', () => {
		expect(() => {
			deleteTask(-1);
		}).not.toThrow();
	});

	test('when passed a task ID that has task data, removes that task from the register', () => {
		setTaskInfo(1, {
			name: 'Test name',
		});
		expect(getTaskInfo(1)).not.toBeNull();

		deleteTask(1);
		expect(getTaskInfo(1)).toBeNull();
	});
});
