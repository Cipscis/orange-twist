import {
	describe,
	expect,
	test,
} from '@jest/globals';
import { escapeRegExpString } from './escapeRegExpString';

describe('escapeRegExpString', () => {
	test('escapes each special character by prefixing with \\', () => {
		const expectations: [string, string][] = [
			['\\', '\\\\'],
			['^', '\\^'],
			['$', '\\$'],
			['.', '\\.'],
			['*', '\\*'],
			['+', '\\+'],
			['?', '\\?'],
			['(', '\\('],
			[')', '\\)'],
			['[', '\\['],
			[']', '\\]'],
			['{', '\\{'],
			['}', '\\}'],
			['|', '\\|'],
			[
				'\\^$.*+?()[]{}|]',
				'\\\\\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|\\]',
			],
		];

		for (const [a, b] of expectations) {
			expect(escapeRegExpString(a)).toEqual(b);
		}
	});

	test('leaves non-special characters alone', () => {
		const safeString = 'This is a string that contains no special characters, it doesn\'t have any at all !@#%&-1234567890';

		expect(escapeRegExpString(safeString)).toEqual(safeString);
	});
});
