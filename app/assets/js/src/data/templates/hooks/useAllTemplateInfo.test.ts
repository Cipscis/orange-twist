import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { renderHook } from '@testing-library/preact';

import { templatesRegister } from '../templatesRegister';
import {
	type TemplateInfo,
	clear,
	useAllTemplateInfo,
} from 'data';

const firstTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '{{{0}}}',
};

const secondTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '<a href="{{{0}}}">{{{1}}}</a>',
};

describe('useAllTemplateInfo', () => {
	beforeEach(() => {
		templatesRegister.set([
			['example template', { name: 'example template', ...firstTemplateInfo }],
			['another template', { name: 'another template', ...secondTemplateInfo }],
		]);
	});

	afterEach(() => {
		clear();
	});

	test('when passed no arguments, if there are no templates, returns an empty array', () => {
		clear();

		const { result } = renderHook(() => useAllTemplateInfo());
		expect(result.current).toEqual([]);
	});

	test('when passed no arguments, returns an array of info on all templates', () => {
		const { result } = renderHook(() => useAllTemplateInfo());

		expect(result.current).toEqual([
			{
				name: 'example template',
				...firstTemplateInfo,
			},
			{
				name: 'another template',
				...secondTemplateInfo,
			},
		]);
	});
});
