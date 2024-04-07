import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	type TemplateInfo,
	clear,
	getTemplateInfo,
	setTemplateInfo,
} from 'data';

describe('setTemplateInfo', () => {
	afterEach(() => {
		clear();
	});

	test('when passed a template name without existing data, creates a new template with default information filling in the blanks', () => {
		expect(getTemplateInfo('example template')).toBeNull();

		setTemplateInfo(
			'example template',
			{
				template: '{{{0}}}',
			} satisfies Omit<TemplateInfo, 'name'> // <- Ensure we're testing every option
		);

		expect(getTemplateInfo('example template')).toEqual({
			name: 'example template',
			template: '{{{0}}}',
		});
	});

	test('when passed a template name with existing data, updates that template with the passed data', () => {
		setTemplateInfo('example template', {
			template: '{{{0}}}',
		} satisfies Omit<TemplateInfo, 'name'>);

		expect(getTemplateInfo('example template')).toEqual({
			name: 'example template',
			template: '{{{0}}}',
		});

		setTemplateInfo('example template', {
			template: '<a href="{{{0}}}">{{{1}}}</a>',
		});

		expect(getTemplateInfo('example template')).toEqual({
			name: 'example template',
			template: '<a href="{{{0}}}">{{{1}}}</a>',
		});
	});
});
