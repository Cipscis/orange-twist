import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { prompt } from './prompt';

describe('prompt', () => {
	test('returns a Promise', () => {
		expect(prompt('Test message')).toBeInstanceOf(Promise);
	});
});
