import {
	describe,
	expect,
	test,
} from '@jest/globals';

import { getTemplateAlias } from './getTemplateAlias';

describe('getTemplateAlias', () => {
	test('converts a string into a kebab-case string', () => {
		expect(
			getTemplateAlias('Thīs Īs - ā3 (TEST)')
		).toBe('this-is-a3-test');
	});
});
