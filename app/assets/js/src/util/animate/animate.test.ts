import {
	afterAll,
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import { configMocks, mockAnimationsApi } from 'jsdom-testing-mocks';

import { CSSKeyframes } from '../CSSKeyframes';

import { animate } from '.';

configMocks({
	afterEach,
	afterAll,
});
mockAnimationsApi();

describe('animate', () => {
	test('returns an Animation', () => {
		const testElement = document.createElement('div');
		document.body.append(testElement);

		const result = animate(testElement, CSSKeyframes.DISAPPEAR_UP);

		expect(result).toBeInstanceOf(Animation);
	});
});
