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

	test('when passed a template ID without existing data, creates a new template with default information filling in the blanks', () => {
		expect(getTemplateInfo(1)).toBeNull();

		setTemplateInfo(
			1,
			{
				name: 'example template',
				template: '{{{0}}}',
				sortIndex: 1,
			} satisfies Omit<TemplateInfo, 'id'> // <- Ensure we're testing every option
		);

		expect(getTemplateInfo(1)).toEqual({
			id: 1,
			name: 'example template',
			template: '{{{0}}}',
			sortIndex: 1,
		});
	});

	test('when passed a template ID with existing data, updates that template with the passed data', () => {
		setTemplateInfo(1, {
			name: 'example template',
			template: '{{{0}}}',
			sortIndex: 1,
		} satisfies Omit<TemplateInfo, 'id'>);

		expect(getTemplateInfo(1)).toEqual({
			id: 1,
			name: 'example template',
			template: '{{{0}}}',
			sortIndex: 1,
		});

		setTemplateInfo(1, {
			template: '<a href="{{{0}}}">{{{1}}}</a>',
		});

		expect(getTemplateInfo(1)).toEqual({
			id: 1,
			name: 'example template',
			template: '<a href="{{{0}}}">{{{1}}}</a>',
			sortIndex: 1,
		});
	});
});
