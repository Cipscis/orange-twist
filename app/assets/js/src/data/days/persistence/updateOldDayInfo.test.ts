import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { updateOldDayInfo } from './updateOldDayInfo';

describe('updateOldDayInfo', () => {
	test('throws an error if passed unrecognised data', () => {
		expect(() => {
			updateOldDayInfo('invalid data');
		}).toThrow();
	});
});
