import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { encodeDayTaskKey } from './encodeDayTaskKey';
import { decodeDayTaskKey } from './decodeDayTaskKey';

describe('decodeDayTaskKey', () => {
	test('converts an encoded string into a `DayTaskIdentifier`', () => {
		expect(
			decodeDayTaskKey('2023-11-16_123')
		).toEqual({ dayName: '2023-11-16', taskId: 123 });
	});

	test('is reversible', () => {
		const testKey = '2023-11-16_456';

		expect(
			encodeDayTaskKey(decodeDayTaskKey(testKey))
		).toBe(testKey);
	});

	test('throws an error if passed an invalid key', () => {
		expect(
			/* @ts-expect-error TypeScript tries to enforce the key format */
			() => decodeDayTaskKey('test')
		).toThrow();
	});
});
