import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { setTaskInfo } from './setTaskInfo';
import { getTaskInfo } from './getTaskInfo';

import { deleteTaskInfo } from './deleteTaskInfo';

describe('deleteTaskInfo', () => {
	test('when passed a task ID without any task data, does nothing', () => {
		expect(() => {
			deleteTaskInfo(-1);
		}).not.toThrow();
	});

	test('when passed a task ID that has task data, removes that task from the register', () => {
		setTaskInfo(1, {
			name: 'Test name',
		});
		expect(getTaskInfo(1)).not.toBeNull();

		deleteTaskInfo(1);
		expect(getTaskInfo(1)).toBeNull();
	});
});
