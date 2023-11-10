import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { TaskStatus } from 'types/TaskStatus';
import { loadDays } from './loadDays';
import { daysRegister } from '../daysRegister';

const ninthDayInfo = {
	note: 'Ninth note',
	tasks: [{
		id: 1,
		note: 'Task note',
		status: TaskStatus.TODO,
	}],
};

const tenthDayInfo = {
	note: 'Tenth note',
	tasks: [
		{
			id: 1,
			note: 'Task note',
			status: TaskStatus.IN_PROGRESS,
		},
		{
			id: 2,
			note: 'Second task note',
			status: TaskStatus.INVESTIGATING,
		},
	],
};

describe('loadDays', () => {
	beforeEach(() => {
		localStorage.setItem('days', JSON.stringify([
			['2023-11-09', { name: '2023-11-09', ...ninthDayInfo }],
			['2023-11-10', { name: '2023-11-10', ...tenthDayInfo }],
		]));
		daysRegister.clear();
	});

	test('returns a Promise that resolves when the days register has been filled with the persisted days data', async () => {
		expect(Array.from(daysRegister.entries())).toEqual([]);

		const loadDaysPromise = loadDays();
		expect(loadDaysPromise).toBeInstanceOf(Promise);

		expect(Array.from(daysRegister.entries())).toEqual([]);

		const loadDaysResult = await loadDaysPromise;
		expect(loadDaysResult).toBeUndefined();

		expect(Array.from(daysRegister.entries())).toEqual([
			['2023-11-09', { name: '2023-11-09', ...ninthDayInfo }],
			['2023-11-10', { name: '2023-11-10', ...tenthDayInfo }],
		]);
	});

	test('returns a Promise that resolves if there is no data to load', async () => {
		localStorage.clear();

		expect(Array.from(daysRegister.entries())).toEqual([]);

		const loadDaysPromise = loadDays();
		expect(loadDaysPromise).toBeInstanceOf(Promise);

		expect(Array.from(daysRegister.entries())).toEqual([]);

		const loadDaysResult = await loadDaysPromise;
		expect(loadDaysResult).toBeUndefined();

		expect(Array.from(daysRegister.entries())).toEqual([]);
	});

	test('returns a Promise that rejects if invalid JSON has been persisted', () => {
		localStorage.setItem('days', 'invalid JSON');

		expect(loadDays()).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if invalid data has been persisted', () => {
		localStorage.setItem('days', JSON.stringify(['Invalid data']));

		expect(loadDays()).rejects.toBeInstanceOf(Error);
	});

	test('triggers only a single "set" event', async () => {
		const spy = jest.fn();
		daysRegister.addEventListener('set', spy);

		await loadDays();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(
			Array.from(
				daysRegister.entries()
			).map(
				([key, value]) => ({ key, value })
			)
		);
	});
});
