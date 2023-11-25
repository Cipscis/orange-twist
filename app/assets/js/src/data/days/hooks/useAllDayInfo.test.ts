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

import { useAllDayInfo } from './useAllDayInfo';

const ninthDayInfo: Omit<DayInfo, 'name'> = {
	note: 'Ninth note',
	tasks: [1],
};

const tenthDayInfo: Omit<DayInfo, 'name'> = {
	note: 'Tenth note',
	tasks: [1, 2],
};

describe('useAllDayInfo', () => {
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

		const { result } = renderHook(() => useAllDayInfo());
		expect(result.current).toEqual([]);
	});

	test('when passed no arguments, returns an array of info on all days', () => {
		const { result } = renderHook(() => useAllDayInfo());

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
});
