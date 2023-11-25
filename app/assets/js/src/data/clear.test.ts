import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getAllDayInfo, setDayInfo } from './days';
import { getAllTaskInfo, setTaskInfo } from './tasks';
import { getAllDayTaskInfo, setDayTaskInfo } from './dayTasks';

import { clear } from './clear';

describe('clear', () => {
	test('clears all day, task, and day task data', () => {
		setDayInfo('2023-11-25', {});
		setDayInfo('2023-11-26', {});

		setTaskInfo(1, {});
		setTaskInfo(2, {});

		setDayTaskInfo({ dayName: '2023-11-25', taskId: 1 }, {});
		setDayTaskInfo({ dayName: '2023-11-26', taskId: 2 }, {});

		clear();

		expect(getAllDayInfo().length).toBe(0);
		expect(getAllTaskInfo().length).toBe(0);
		expect(getAllDayTaskInfo().length).toBe(0);
	});
});
