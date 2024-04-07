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

describe('useAllTemplateInfo', () => {
	beforeEach(() => {
		templatesRegister.set([
			[1, { id: 1, ...firstTemplateInfo }],
			[2, { id: 2, ...secondTemplateInfo }],
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
				id: 1,
				...firstTemplateInfo,
			},
			{
				id: 2,
				...secondTemplateInfo,
			},
		]);
	});
});
