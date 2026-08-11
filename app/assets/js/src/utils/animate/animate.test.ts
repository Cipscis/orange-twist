import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { CSSKeyframes } from '../CSSKeyframes';

import { animate } from './animate';

describe('animate', () => {
	test('returns an Animation', () => {
		const testElement = document.createElement('div');
		document.body.append(testElement);

		const result = animate(testElement, CSSKeyframes.DISAPPEAR_UP);

		expect(result).toBeInstanceOf(Animation);
	});
});
