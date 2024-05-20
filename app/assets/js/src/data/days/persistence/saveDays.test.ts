import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ls } from 'persist';

import { setDayInfo } from '../setDayInfo';
import { saveDays } from './saveDays';
import { clear } from '../../shared';

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
		clear();
	});

	test('returns a Promise that resolves when the content of the days register has been persisted', async () => {
		expect(localStorage.getItem('days')).toBeNull();

		setDayInfo('2023-11-09', ninthDayInfo);
		setDayInfo('2023-11-10', tenthDayInfo);

		const saveDaysPromise = saveDays(ls);
		expect(saveDaysPromise).toBeInstanceOf(Promise);
		await expect(saveDaysPromise).resolves.toBeUndefined();

		expect(localStorage.getItem('days')).toEqual(JSON.stringify([
			['2023-11-09', { name: '2023-11-09', ...ninthDayInfo }],
			['2023-11-10', { name: '2023-11-10', ...tenthDayInfo }],
		]));
	});
});
