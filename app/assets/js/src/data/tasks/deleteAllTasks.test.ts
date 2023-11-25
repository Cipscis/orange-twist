import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { setTaskInfo } from './setTaskInfo';
import { getAllTaskInfo } from './getAllTaskInfo';

import { deleteAllTasks } from './deleteAllTasks';

describe('deleteAllTasks', () => {
	test('deletes all tasks', () => {
		setTaskInfo(1, {});
		setTaskInfo(2, {});

		deleteAllTasks();

		expect(getAllTaskInfo().length).toBe(0);
	});
});
