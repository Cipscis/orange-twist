import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import { templatesRegister } from '../templatesRegister';
import {
	type TemplateInfo,
	clear,
	useTemplateInfo,
	setTemplateInfo,
} from 'data';

const firstTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '{{{0}}}',
};

const secondTemplateInfo: Omit<TemplateInfo, 'name'> = {
	template: '<a href="{{{0}}}">{{{1}}}</a>',
};

describe('useTemplateInfo', () => {
	beforeEach(() => {
		templatesRegister.set([
			['example template', { name: 'example template', ...firstTemplateInfo }],
			['another template', { name: 'another template', ...secondTemplateInfo }],
		]);
	});

	afterEach(() => {
		clear();
	});

	test('when passed a template name that has no matching template, returns null', () => {
		const { result } = renderHook(() => useTemplateInfo('2023-11-08'));

		expect(result.current).toBeNull();
	});

	test('when passed a template name that has a matching template, returns that template\'s info', () => {
		const { result } = renderHook(() => useTemplateInfo('example template'));

		expect(result.current).toEqual({
			name: 'example template',
			...firstTemplateInfo,
		});
	});

	test('when passed a template name, re-renders only when the matching template is changed', async () => {
		let renderCount = 0;
		const { result } = renderHook(() => {
			renderCount += 1;
			return useTemplateInfo('example template');
		});

		expect(result.current).toEqual({
			name: 'example template',
			...firstTemplateInfo,
		});
		expect(renderCount).toBe(1);

		// Updating a different template shouldn't cause re-renders
		await act(() => setTemplateInfo('another template', { template: '*{{{0}}}*' }));
		expect(renderCount).toBe(1);

		// Updating the watched template should cause re-render with new info
		await act(() => setTemplateInfo('example template', { template: '*{{{0}}}' }));
		expect(result.current).toEqual({
			name: 'example template',
			...firstTemplateInfo,
			template: '*{{{0}}}',
		});
	});

	test('when the argument changes, returns updated information', () => {
		const {
			rerender,
			result,
		} = renderHook(
			(templateName) => useTemplateInfo(templateName),
			{ initialProps: 'example template' }
		);
		expect(result.current).toEqual({
			name: 'example template',
			...firstTemplateInfo,
		});

		rerender('another template');
		expect(result.current).toEqual({
			name: 'another template',
			...secondTemplateInfo,
		});
	});
});
