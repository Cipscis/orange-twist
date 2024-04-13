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
			deleteTemplate(1);
		}).not.toThrow();
	});

	test('when passed a template name that has template data, removes that template from the register', () => {
		setTemplateInfo(1, {
			template: '{{{0}}}',
		});
		expect(getTemplateInfo(1)).not.toBeNull();

		deleteTemplate(1);
		expect(getTemplateInfo(1)).toBeNull();
	});
});
