import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { TaskStatus } from 'types/TaskStatus';
import {
	setDayInfo,
	setDayTaskInfo,
	setTaskInfo,
} from 'data';

import { writeExportData } from './writeExportData';

describe('writeExportData', () => {
	beforeEach(() => {
		localStorage.clear();
		setTaskInfo(1, {
			name: 'Test task',
			note: 'Task note',
			status: TaskStatus.TODO,
		}, { forCurrentDay: false });
		setDayInfo('2023-12-11', {
			note: 'Day note',
			tasks: [1],
		});
		setDayTaskInfo({
			dayName: '2023-12-11',
			taskId: 1,
		}, {
			note: 'Day task note',
			status: TaskStatus.TODO,
		});
	});

	test('constructs an ExportData object from current data', () => {
		const result = writeExportData();

		expect(result).toEqual({
			days: [['2023-12-11', {
				name: '2023-12-11',
				note: 'Day note',
				tasks: [1],
			}]],
			tasks: [[1, {
				id: 1,
				name: 'Test task',
				note: 'Task note',
				status: TaskStatus.TODO,
				sortIndex: -1,
			}]],
			dayTasks: [['2023-12-11_1', {
				dayName: '2023-12-11',
				taskId: 1,
				note: 'Day task note',
				status: TaskStatus.TODO,
			}]],
		});
	});
});
