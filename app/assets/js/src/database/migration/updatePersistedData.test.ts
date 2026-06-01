import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { updatePersistedData } from './updatePersistedData';

describe('updatePersistedData', () => {
	test('updates any existing data from Orange Twist v1.4.0 or lower', async () => {
		// Orange Twist 1.4.0 includes templates but not images, and still has all data in local storage
		localStorage.setItem('days', '[["2026-05-17",{"name":"2026-05-17","note":"Day 1 note","tasks":[1,2]}]]');
		localStorage.setItem('tasks', '[[1,{"id":1,"name":"Test task 1","status":"todo","note":"Test task 1 note","sortIndex":-1}],[2,{"id":2,"name":"Test task 2","status":"in-progress","note":"Test task 2 note","sortIndex":-2}]]');
		localStorage.setItem('day-tasks', '[["2026-05-17_1",{"dayName":"2026-05-17","taskId":1,"status":"todo","note":"Day task for task 1 day 1 note","summary":"Day task for task 1 day 1 summary"}],["2026-05-17_2",{"dayName":"2026-05-17","taskId":2,"status":"in-progress","note":"Day task for task 2 day 1 note","summary":"Day task for task 2 day 1 summary"}]]');
		localStorage.setItem('templates', '[[1,{"id":1,"name":"Template 1 name","template":"Template 1","sortIndex":-1}]]');

		const updatedData = await updatePersistedData();

		expect(updatedData).toEqual({
			day: [
				{
					id: 1,
					year: 2026,
					month: 5,
					day: 17,
					note: 'Day 1 note',
				},
			],
			task: [
				{
					id: 1,
					name: 'Test task 1',
					note: 'Test task 1 note',
					status: 1,
					sortIndex: -1,
				},
				{
					id: 2,
					name: 'Test task 2',
					note: 'Test task 2 note',
					status: 2,
					sortIndex: -2,
				},
			],
			day_task: [
				{
					id: 1,
					day: 1,
					task: 1,
					note: 'Day task for task 1 day 1 note',
					summary: 'Day task for task 1 day 1 summary',
					status: 1,
					sortIndex: 0,
				},
				{
					id: 2,
					day: 1,
					task: 2,
					note: 'Day task for task 2 day 1 note',
					summary: 'Day task for task 2 day 1 summary',
					status: 2,
					sortIndex: 1,
				},
			],
			status: [
				{
					id: 1,
					name: 'todo',
					isComplete: false,
				},
				{
					id: 2,
					name: 'in-progress',
					isComplete: false,
				},
				{
					id: 3,
					name: 'completed',
					isComplete: true,
				},

				{
					id: 4,
					name: 'investigating',
					isComplete: false,
				},
				{
					id: 5,
					name: 'in-review',
					isComplete: false,
				},
				{
					id: 6,
					name: 'ready-to-test',
					isComplete: false,
				},
				{
					id: 7,
					name: 'paused',
					isComplete: false,
				},
				{
					id: 8,
					name: 'approved-to-deploy',
					isComplete: false,
				},
				{
					id: 9,
					name: 'will-not-do',
					isComplete: true,
				},
			],
			template: [
				{
					id: 1,
					name: 'Template 1 name',
					template: 'Template 1',
					sortIndex: -1,
				},
			],
			image: {},
		});
	});

	test.todo('updates any existing data stored in the database v1');
});
