import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { setDayInfo } from '../setDayInfo';
import { saveDays } from './saveDays';
import { daysRegister } from '../daysRegister';

const ninthDayInfo = {
	note: 'Ninth note',
	tasks: [1],
};

const tenthDayInfo = {
	note: 'Tenth note',
	tasks: [1, 2],
};

describe('saveDays', () => {
	beforeEach(() => {
		localStorage.clear();
		daysRegister.clear();
	});

	test('returns a Promise that resolves when the content of the days register has been persisted', async () => {
		setDayInfo('2023-11-09', ninthDayInfo);
		setDayInfo('2023-11-10', tenthDayInfo);

		expect(localStorage.getItem('days')).toBeNull();

		const saveDaysPromise = saveDays();
		expect(saveDaysPromise).toBeInstanceOf(Promise);

		expect(localStorage.getItem('days')).toBeNull();

		const saveDaysResult = await saveDaysPromise;
		expect(saveDaysResult).toBeUndefined();

		expect(localStorage.getItem('days')).toEqual(JSON.stringify([
			['2023-11-09', { name: '2023-11-09', ...ninthDayInfo }],
			['2023-11-10', { name: '2023-11-10', ...tenthDayInfo }],
		]));
	});
});
