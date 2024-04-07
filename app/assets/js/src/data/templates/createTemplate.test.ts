import {
	afterEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { templatesRegister } from './templatesRegister';
import {
	type TemplateInfo,
	clear,
	createTemplate,
	getTemplateInfo,
} from 'data';

describe('createTemplate', () => {
	afterEach(() => {
		clear();
	});

	test('returns the ID of a newly created template', () => {
		expect(Array.from(templatesRegister.keys())).toEqual([]);

		const newId1 = createTemplate();
		expect(Array.from(templatesRegister.keys())).toEqual([newId1]);

		const newId2 = createTemplate();
		expect(newId2).not.toBe(newId1);
		expect(Array.from(templatesRegister.keys())).toEqual([newId1, newId2]);
	});

	test('can be called without any arguments, using all default values to create a new template', () => {
		const newId = createTemplate();

		const templateInfo = getTemplateInfo(newId);
		expect(templateInfo).toEqual({
			id: newId,
			name: 'New template',
			template: '',
			sortIndex: -1,
		});
	});

	test('accepts a partial templateInfo object, filling in any blanks with defaults', () => {
		const newIdPartial = createTemplate({
			name: 'Custom template name',
		});

		expect(getTemplateInfo(newIdPartial)).toEqual({
			id: newIdPartial,
			name: 'Custom template name',
			template: '',
			sortIndex: -1,
		});

		const newIdFull = createTemplate({
			name: 'Custom template name',
			template: '{{{0}}}',
			sortIndex: -1,
		} satisfies Omit<TemplateInfo, 'id'>);

		expect(getTemplateInfo(newIdFull)).toEqual({
			id: newIdFull,
			name: 'Custom template name',
			template: '{{{0}}}',
			sortIndex: -1,
		});
	});
});
