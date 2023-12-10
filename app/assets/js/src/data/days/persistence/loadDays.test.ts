import {
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';

import { loadDays } from './loadDays';
import { daysRegister } from '../daysRegister';
import { clear } from '../../shared';

const ninthDayInfo = {
	note: 'Ninth note',
	tasks: [1],
};

const tenthDayInfo = {
	note: 'Tenth note',
	tasks: [1, 2],
};

describe('loadDays', () => {
	beforeEach(() => {
		localStorage.setItem('days', JSON.stringify([
			['2023-11-09', { name: '2023-11-09', ...ninthDayInfo }],
			['2023-11-10', { name: '2023-11-10', ...tenthDayInfo }],
		]));
		clear();
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

	test('returns a Promise that rejects if invalid JSON has been persisted', async () => {
		localStorage.setItem('days', 'invalid JSON');

		await expect(loadDays()).rejects.toBeInstanceOf(Error);
	});

	test('returns a Promise that rejects if invalid data has been persisted', async () => {
		localStorage.setItem('days', JSON.stringify(['Invalid data']));

		await expect(loadDays()).rejects.toBeInstanceOf(Error);
	});

	test('triggers up to a single "delete" event and a single "set" event', async () => {
		const spy = jest.fn();
		daysRegister.addEventListener('delete', spy);
		daysRegister.addEventListener('set', spy);

		await loadDays();

		const entryObjArr = Array.from(
			daysRegister.entries()
		).map(
			([key, value]) => ({ key, value })
		);

		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(entryObjArr);

		await loadDays();

		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy).toHaveBeenNthCalledWith(2, entryObjArr);
		expect(spy).toHaveBeenNthCalledWith(3, entryObjArr);
	});

	test('overwrites any existing data in the register', async () => {
		const testData = [
			['2020-11-09', { name: '2020-11-09', ...ninthDayInfo }],
			['2020-11-10', { name: '2020-10-09', ...ninthDayInfo }],
		] as const;

		daysRegister.set(testData);
		expect(Array.from(daysRegister.entries())).toEqual(testData);

		await loadDays();

		expect(Array.from(daysRegister.entries())).toEqual([
			['2023-11-09', { name: '2023-11-09', ...ninthDayInfo }],
			['2023-11-10', { name: '2023-11-10', ...tenthDayInfo }],
		]);
	});

	test('can be passed serialised data as an argument', async () => {
		await loadDays(JSON.stringify([
			['2023-12-10', {
				name: '2023-12-10',
				note: '',
				tasks: [],
			}],
		]));
		expect(Array.from(daysRegister.entries())).toEqual([
			['2023-12-10', {
				name: '2023-12-10',
				note: '',
				tasks: [],
			}],
		]);
	});
});
