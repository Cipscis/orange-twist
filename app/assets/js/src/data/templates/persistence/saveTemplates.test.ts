import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import {
	type TemplateInfo,
	clear,
	saveTemplates,
	setTemplateInfo,
} from 'data';

const firstTemplateInfo: Omit<TemplateInfo, 'id'> = {
	name: 'example template',
	template: '{{{0}}}',
	sortIndex: -1,
};

const secondTemplateInfo: Omit<TemplateInfo, 'id'> = {
	name: 'another template',
	template: '<a href="{{{0}}}">{{{1}}}</a>',
	sortIndex: -1,
};

describe('saveTemplates', () => {
	beforeEach(() => {
		localStorage.clear();
		clear();
	});

	test('returns a Promise that resolves when the content of the templates register has been persisted', async () => {
		setTemplateInfo(1, firstTemplateInfo);
		setTemplateInfo(2, secondTemplateInfo);

		expect(localStorage.getItem('templates')).toBeNull();

		const saveTemplatesPromise = saveTemplates();
		expect(saveTemplatesPromise).toBeInstanceOf(Promise);

		expect(localStorage.getItem('templates')).toBeNull();

		const saveTemplatesResult = await saveTemplatesPromise;
		expect(saveTemplatesResult).toBeUndefined();

		expect(localStorage.getItem('templates')).toEqual(JSON.stringify([
			[1, { id: 1, ...firstTemplateInfo }],
			[2, { id: 2, ...secondTemplateInfo }],
		]));
	});
});
