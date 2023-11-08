import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { setDayInfo } from './setDayInfo';
import { getDayInfo } from './getDayInfo';

import { deleteDayInfo } from './deleteDayInfo';

describe('deleteDayInfo', () => {
	test('when passed a day name without any day data, does nothing', () => {
		expect(() => {
			deleteDayInfo('2023-11-08');
		}).not.toThrow();
	});

	test('when passed a day name that has day data, removes that day from the register', () => {
		setDayInfo('2023-11-08', {
			note: 'Test note',
		});
		expect(getDayInfo('2023-11-08')).not.toBeNull();

		deleteDayInfo('2023-11-08');
		expect(getDayInfo('2023-11-08')).toBeNull();
	});
});
