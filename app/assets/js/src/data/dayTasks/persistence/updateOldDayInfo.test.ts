import { describe, expect, test } from '@jest/globals';

import { updateOldDayTaskInfo } from './updateOldDayTaskInfo';

describe('updateOldDayTaskInfo', () => {
	test('throws an error if passed unrecognised data', () => {
		expect(() => {
			updateOldDayTaskInfo('invalid data');
		}).toThrow();
	});
});
