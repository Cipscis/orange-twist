import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { setDayInfo } from './setDayInfo';
import { getAllDayInfo } from './getAllDayInfo';

import { deleteAllDays } from './deleteAllDays';

describe('deleteAllDays', () => {
	test('deletes all days', () => {
		setDayInfo('2023-11-25', {});
		setDayInfo('2023-11-26', {});

		deleteAllDays();

		expect(getAllDayInfo().length).toBe(0);
	});
});
