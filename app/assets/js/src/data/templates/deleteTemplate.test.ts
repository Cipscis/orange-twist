import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	clear,
	deleteTemplate,
	getTemplateInfo,
	setTemplateInfo,
} from 'data';

describe('deleteTemplate', () => {
	afterEach(() => {
		clear();
	});

	test('when passed a template name without any template data, does nothing', () => {
		expect(() => {
			deleteTemplate('example template');
		}).not.toThrow();
	});

	test('when passed a template name that has template data, removes that template from the register', () => {
		setTemplateInfo('example template', {
			template: '{{{0}}}',
		});
		expect(getTemplateInfo('example template')).not.toBeNull();

		deleteTemplate('example template');
		expect(getTemplateInfo('example template')).toBeNull();
	});
});
