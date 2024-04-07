import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getAllDayInfo, setDayInfo } from '../days';
import { getAllTaskInfo, setTaskInfo } from '../tasks';
import { getAllDayTaskInfo, setDayTaskInfo } from '../dayTasks';
import { getAllTemplateInfo, setTemplateInfo } from '../templates';

import { clear } from './clear';

describe('clear', () => {
	test('clears all day, task, day task, and template data', () => {
		setDayInfo('2023-11-25', {});
		setDayInfo('2023-11-26', {});

		setTaskInfo(1, {});
		setTaskInfo(2, {});

		setDayTaskInfo({ dayName: '2023-11-25', taskId: 1 }, {});
		setDayTaskInfo({ dayName: '2023-11-26', taskId: 2 }, {});

		setTemplateInfo(1, {});
		setTemplateInfo(2, {});

		clear();

		expect(getAllDayInfo().length).toBe(0);
		expect(getAllTaskInfo().length).toBe(0);
		expect(getAllDayTaskInfo().length).toBe(0);
		expect(getAllTemplateInfo().length).toBe(0);
	});
});
