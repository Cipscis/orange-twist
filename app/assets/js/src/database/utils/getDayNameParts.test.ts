import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getDayNameParts } from './getDayNameParts';

describe('getDayNameParts', () => {
	test('converts a day name to the correct parts', () => {
		expect(
			getDayNameParts('2026-04-12')
		).toEqual([2026, 4, 12]);
	});
});
