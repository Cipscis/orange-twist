import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { setDayTaskInfo } from './setDayTaskInfo';
import { getDayTaskInfo } from './getDayTaskInfo';

import { deleteDayTask } from './deleteDayTask';

describe('deleteDayTask', () => {
	test('when passed a day name and task ID without data, does nothing', () => {
		expect(() => {
			deleteDayTask('2023-11-13', -1);
		}).not.toThrow();
	});

	test('when passed a task ID that has task data, removes that task from the register', () => {
		setDayTaskInfo('2023-11-13', 1, {
			note: 'Test note',
		});
		expect(getDayTaskInfo('2023-11-13', 1)).not.toBeNull();

		deleteDayTask('2023-11-13', 1);
		expect(getDayTaskInfo('2023-11-13', 1)).toBeNull();
	});
});
