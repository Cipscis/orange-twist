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

const firstTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '{{{0}}}',
};

const secondTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '<a href="{{{0}}}">{{{1}}}</a>',
};

describe('saveTemplates', () => {
	beforeEach(() => {
		localStorage.clear();
		clear();
	});

	test('returns a Promise that resolves when the content of the templates register has been persisted', async () => {
		setTemplateInfo('example name', firstTemplateInfo);
		setTemplateInfo('another name', secondTemplateInfo);

		expect(localStorage.getItem('templates')).toBeNull();

		const saveTemplatesPromise = saveTemplates();
		expect(saveTemplatesPromise).toBeInstanceOf(Promise);

		expect(localStorage.getItem('templates')).toBeNull();

		const saveTemplatesResult = await saveTemplatesPromise;
		expect(saveTemplatesResult).toBeUndefined();

		expect(localStorage.getItem('templates')).toEqual(JSON.stringify([
			['example name', { name: 'example name', ...firstTemplateInfo }],
			['another name', { name: 'another name', ...secondTemplateInfo }],
		]));
	});
});
