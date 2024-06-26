import {
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { ls } from 'persist';

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
		expect(localStorage.getItem('templates')).toBeNull();

		setTemplateInfo(1, firstTemplateInfo);
		setTemplateInfo(2, secondTemplateInfo);

		const saveTemplatesPromise = saveTemplates(ls);
		expect(saveTemplatesPromise).toBeInstanceOf(Promise);
		await expect(saveTemplatesPromise).resolves.toBeUndefined();

		expect(localStorage.getItem('templates')).toEqual(JSON.stringify([
			[1, { id: 1, ...firstTemplateInfo }],
			[2, { id: 2, ...secondTemplateInfo }],
		]));
	});
});
