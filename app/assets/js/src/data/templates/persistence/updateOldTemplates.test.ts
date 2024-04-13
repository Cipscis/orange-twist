import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { updateOldTemplateInfo } from './updateOldTemplateInfo';

describe('updateOldTemplateInfo', () => {
	test('throws an error if passed unrecognised data', () => {
		expect(() => {
			updateOldTemplateInfo('invalid data');
		}).toThrow();
	});
});
