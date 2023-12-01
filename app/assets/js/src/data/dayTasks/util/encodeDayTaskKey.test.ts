import {
	describe,
	expect,
	test,
} from '@jest/globals';

import type { DayTaskIdentifier } from '../types/DayTaskIdentifier';

import { decodeDayTaskKey } from './decodeDayTaskKey';
import { encodeDayTaskKey } from './encodeDayTaskKey';

describe('encodeDayTaskKey', () => {
	test('converts a `DayTaskIdentifier` into an encoded string', () => {
		expect(
			encodeDayTaskKey({ dayName: '2023-11-16', taskId: 123 })
		).toBe('2023-11-16_123');
	});

	test('is reversible', () => {
		const testIdentifier: DayTaskIdentifier = {
			dayName: '2023-11-16',
			taskId: 456,
		};

		expect(
			decodeDayTaskKey(encodeDayTaskKey(testIdentifier))
		).toEqual(testIdentifier);
	});
});
