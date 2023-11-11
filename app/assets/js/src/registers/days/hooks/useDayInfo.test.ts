import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { renderHook } from '@testing-library/preact';

import type { DayInfo } from '../types';

import { daysRegister } from '../daysRegister';
import { TaskStatus } from 'types/TaskStatus';

import { useDayInfo } from './useDayInfo';

const ninthDayInfo: Omit<DayInfo, 'name'> = {
	note: 'Ninth note',
	tasks: [{
		id: 1,
		note: 'Task note',
		status: TaskStatus.TODO,
	}],
};

const tenthDayInfo: Omit<DayInfo, 'name'> = {
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

describe('useDayInfo', () => {
	beforeEach(() => {
		daysRegister.set([
			['2023-11-09', { name: '2023-11-09', ...ninthDayInfo }],
			['2023-11-10', { name: '2023-11-10', ...tenthDayInfo }],
		]);
	});

	afterEach(() => {
		daysRegister.clear();
	});

	test('when passed no arguments, if there are no days, returns an empty array', () => {
		daysRegister.clear();

		const { result } = renderHook(() => useDayInfo());
		expect(result.current).toEqual([]);
	});

	test('when passed no arguments, returns an array of info on all days', () => {
		const { result } = renderHook(() => useDayInfo());

		expect(result.current).toEqual([
			{
				name: '2023-11-09',
				...ninthDayInfo,
			},
			{
				name: '2023-11-10',
				...tenthDayInfo,
			},
		]);
	});

	test('when passed a day name that has no matching day, returns null', () => {
		const { result } = renderHook(() => useDayInfo('2023-11-08'));

		expect(result.current).toBeNull();
	});

	test('when passed a day name that has a matching day, returns that day\'s info', () => {
		const { result } = renderHook(() => useDayInfo('2023-11-09'));

		expect(result.current).toEqual({
			name: '2023-11-09',
			...ninthDayInfo,
		});
	});
});
