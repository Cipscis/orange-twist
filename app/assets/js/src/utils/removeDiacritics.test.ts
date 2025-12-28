import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { removeDiacritics } from './removeDiacritics';

describe('removeDiacritics', () => {
	test('removes diacritics from a string', () => {
		expect(
			removeDiacritics('abcDEF')
		).toBe('abcDEF');

		expect(
			removeDiacritics('ābcDĒF')
		)
			.toBe('abcDEF');
	});
});
