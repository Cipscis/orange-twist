import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { getTaggedLsDump } from './getTaggedLsDump';
import type { TaggedLegacyExportData } from 'database/types';

describe('getTaggedLsDump', () => {
	beforeEach(() => localStorage.clear());

	test('returns null if nothing is stored in localStorage', () => {
		const dump = getTaggedLsDump();

		expect(dump).toBeNull();
	});

	test('returns a legacy export data object if data is stored in localStorage', () => {
		localStorage.setItem('days', '[["2026-05-17",{"name":"2026-05-17","note":"Day 1 note","tasks":[1,2]}]]');
		localStorage.setItem('tasks', '[[1,{"id":1,"name":"Test task 1","status":"todo","note":"Test task 1 note","sortIndex":-1}],[2,{"id":2,"name":"Test task 2","status":"in-progress","note":"Test task 2 note","sortIndex":-2}]]');
		localStorage.setItem('day-tasks', '[["2026-05-17_1",{"dayName":"2026-05-17","taskId":1,"status":"todo","note":"Day task for task 1 day 1 note","summary":"Day task for task 1 day 1 summary"}],["2026-05-17_2",{"dayName":"2026-05-17","taskId":2,"status":"in-progress","note":"Day task for task 2 day 1 note","summary":"Day task for task 2 day 1 summary"}]]');
		localStorage.setItem('templates', '[[1,{"id":1,"name":"Template 1 name","template":"Template 1","sortIndex":-1}]]');

		const dump = getTaggedLsDump();

		expect(dump).toEqual({
			schemaVersion: '1.0.0',
			data: {
				data: {
					days: [
						['2026-05-17', {
							name: '2026-05-17',
							note: 'Day 1 note',
							tasks: [1, 2],
						}],
					],
					tasks: [
						[1, {
							id: 1,
							name: 'Test task 1',
							note: 'Test task 1 note',
							status: 'todo',
							sortIndex: -1,
						}],
						[2, {
							id: 2,
							name: 'Test task 2',
							note: 'Test task 2 note',
							status: 'in-progress',
							sortIndex: -2,
						}],
					],
					['day-tasks']: [
						['2026-05-17_1', {
							dayName: '2026-05-17',
							taskId: 1,
							status: 'todo',
							summary: 'Day task for task 1 day 1 summary',
							note: 'Day task for task 1 day 1 note',
						}],
						['2026-05-17_2', {
							dayName: '2026-05-17',
							taskId: 2,
							status: 'in-progress',
							summary: 'Day task for task 2 day 1 summary',
							note: 'Day task for task 2 day 1 note',
						}],
					],
					templates: [
						[1, {
							id: 1,
							name: 'Template 1 name',
							template: 'Template 1',
							sortIndex: -1,
						}],
					],
				},
			},
		} satisfies TaggedLegacyExportData);
	});

	test('throws error if malformed data is encountered', () => {
		localStorage.setItem('days', '[[]]');
		localStorage.setItem('tasks', '[]');
		localStorage.setItem('day-tasks', '[]');

		expect(() => getTaggedLsDump()).toThrow();
	});

	test('throws error if malformed JSON is encountered', () => {
		localStorage.setItem('days', '[[]');
		localStorage.setItem('tasks', '[]');
		localStorage.setItem('day-tasks', '[]');

		expect(() => getTaggedLsDump()).toThrow();
	});
});
