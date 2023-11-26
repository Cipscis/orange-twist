import {
	afterAll,
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import { configMocks, mockAnimationsApi } from 'jsdom-testing-mocks';

import { CSSKeyframes } from './CSSKeyframes';

import { animate } from './animate';

configMocks({
	afterEach,
	afterAll,
});
mockAnimationsApi();

describe('animate', () => {
	test('returns a Promise', async () => {
		const testElement = document.createElement('div');
		document.body.append(testElement);

		const result = animate(testElement, CSSKeyframes.SPIN_CW);

		expect(result).toBeInstanceOf(Promise);

		// Let Jest ensure that the promise resolves
		return result;
	});
});
