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
			1,
			{
				name: 'Example template',
				template: '{{{0}}}',
				sortIndex: 1,
			} satisfies Omit<TemplateInfo, 'id'> // <- Ensure we're testing every option
		);
		setTemplateInfo(
			2,
			{
				name: 'Another template',
				template: '<a href="{{{0}}}">{{{1}}}</a>',
				sortIndex: 2,
			} satisfies Omit<TemplateInfo, 'id'> // <- Ensure we're testing every option
		);
	});

	test('when passed a template name that has no matching template, returns null', () => {
		expect(getTemplateInfo(-1)).toBeNull();
	});

	test('when passed a template name that has a matching template, returns that template\'s info', () => {
		expect(getTemplateInfo(1)).toEqual({
			id: 1,
			name: 'Example template',
			template: '{{{0}}}',
			sortIndex: 1,
		});
	});
});
