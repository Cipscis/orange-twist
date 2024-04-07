import {
	beforeAll,
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	type TemplateInfo,
	getTemplateInfo,
	setTemplateInfo,
} from 'data';

describe('getTemplateInfo', () => {
	beforeAll(() => {
		setTemplateInfo(
			'example name',
			{
				template: '{{{0}}}',
			} satisfies Omit<TemplateInfo, 'name'> // <- Ensure we're testing every option
		);
		setTemplateInfo(
			'2023-11-08',
			{
				template: '<a href="{{{0}}}">{{{1}}}</a>',
			} satisfies Omit<TemplateInfo, 'name'> // <- Ensure we're testing every option
		);
	});

	test('when passed a template name that has no matching template, returns null', () => {
		expect(getTemplateInfo('Invalid template')).toBeNull();
	});

	test('when passed a template name that has a matching template, returns that template\'s info', () => {
		expect(getTemplateInfo('example name')).toEqual({
			name: 'example name',
			template: '{{{0}}}',
		});
	});
});
