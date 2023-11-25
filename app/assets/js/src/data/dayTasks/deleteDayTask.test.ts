import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { daysRegister } from 'data/days/daysRegister';
import { getDayInfo } from 'data/days';

import { dayTasksRegister } from './dayTasksRegister';
import { setDayTaskInfo } from './setDayTaskInfo';
import { getDayTaskInfo } from './getDayTaskInfo';
import { getAllDayTaskInfo } from './getAllDayTaskInfo';

import { deleteDayTask } from './deleteDayTask';

describe('deleteDayTask', () => {
	afterEach(() => {
		daysRegister.clear();
		dayTasksRegister.clear();
	});

	test('when passed a day name and task ID without data, does nothing', () => {
		expect(() => {
			deleteDayTask({ dayName: '2023-11-13', taskId: -1 });
		}).not.toThrow();
	});

	test('when passed a task ID that has task data, removes that task from the register', () => {
		setDayTaskInfo(
			{ dayName: '2023-11-13', taskId: 1 },
			{ note: 'Test note' },
		);
		expect(getDayTaskInfo({ dayName: '2023-11-13', taskId: 1 })).not.toBeNull();

		deleteDayTask({ dayName: '2023-11-13', taskId: 1 });
		expect(getDayTaskInfo({ dayName: '2023-11-13', taskId: 1 })).toBeNull();
	});

	test('when passed a partial day task identifier, deletes all matching day tasks', () => {
		setDayTaskInfo({ dayName: '2023-11-17', taskId: 1 }, {});
		setDayTaskInfo({ dayName: '2023-11-17', taskId: 2 }, {});
		setDayTaskInfo({ dayName: '2023-11-18', taskId: 1 }, {});
		setDayTaskInfo({ dayName: '2023-11-18', taskId: 2 }, {});
		setDayTaskInfo({ dayName: '2023-11-19', taskId: 1 }, {});
		setDayTaskInfo({ dayName: '2023-11-19', taskId: 2 }, {});

		deleteDayTask({ dayName: '2023-11-17' });
		expect(getAllDayTaskInfo({ dayName: '2023-11-17' })).toEqual([]);

		deleteDayTask({ taskId: 1 });
		expect(getAllDayTaskInfo({ taskId: 1 })).toEqual([]);

		expect(getAllDayTaskInfo()).toHaveLength(2);
	});

	test('also removes tasks from days', () => {
		setDayTaskInfo({ dayName: '2023-11-19', taskId: 1 }, {});
		setDayTaskInfo({ dayName: '2023-11-19', taskId: 2 }, {});

		expect(getDayInfo('2023-11-19')?.tasks).toEqual([1, 2]);

		deleteDayTask({ dayName: '2023-11-19', taskId: 1 });
		expect(getDayInfo('2023-11-19')?.tasks).toEqual([2]);
	});
});
