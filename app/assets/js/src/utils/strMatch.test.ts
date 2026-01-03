import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { strMatch } from './strMatch';

describe('strMatch', () => {
	test('should check for exact matches', () => {
		expect(
			strMatch('this is a test', 'test')
		).toBe(true);
		expect(
			strMatch('this is a test', 'expect')
		).toBe(false);
	});

	test('should allow ignoring case', () => {
		expect(
			strMatch('this is a test', 'Test', { ignoreCase: false })
		).toBe(false);
		expect(
			strMatch('this is a test', 'Test', { ignoreCase: true })
		).toBe(true);
	});

	test('should allow ignoring diacritics', () => {
		expect(
			strMatch('āēīōū', 'eio', { ignoreDiacritics: false })
		).toBe(false);
		expect(
			strMatch('āēīōū', 'eio', { ignoreDiacritics: true })
		).toBe(true);
	});
});
