import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { setDayTaskInfo } from './setDayTaskInfo';
import { getAllDayTaskInfo } from './getAllDayTaskInfo';

import { deleteAllDayTasks } from './deleteAllDayTasks';

describe('deleteAllDayTasks', () => {
	test('deletes all day tasks', () => {
		setDayTaskInfo({ dayName: '2023-11-25', taskId: 1 }, {});
		setDayTaskInfo({ dayName: '2023-11-26', taskId: 2 }, {});

		deleteAllDayTasks();

		expect(getAllDayTaskInfo().length).toBe(0);
	});
});
