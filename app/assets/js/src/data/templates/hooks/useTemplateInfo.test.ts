import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';

import { act, renderHook } from '@testing-library/preact';

import {
	type TemplateInfo,
	clear,
	useTemplateInfo,
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

describe('useTemplateInfo', () => {
	beforeEach(() => {
		setTemplateInfo(1, firstTemplateInfo);
		setTemplateInfo(2, secondTemplateInfo);
	});

	afterEach(() => {
		clear();
	});

	test('when passed a template ID that has no matching template, returns null', () => {
		const { result } = renderHook(() => useTemplateInfo(-1));

		expect(result.current).toBeNull();
	});

	test('when passed a template ID that has a matching template, returns that template\'s info', () => {
		const { result } = renderHook(() => useTemplateInfo(1));

		expect(result.current).toEqual({
			id: 1,
			...firstTemplateInfo,
		});
	});

	test('when passed a template name, re-renders only when the matching template is changed', async () => {
		let renderCount = 0;
		const { result } = renderHook(() => {
			renderCount += 1;
			return useTemplateInfo(1);
		});

		expect(result.current).toEqual({
			id: 1,
			...firstTemplateInfo,
		});
		expect(renderCount).toBe(1);

		// Updating a different template shouldn't cause re-renders
		await act(() => setTemplateInfo(2, { template: '*{{{0}}}*' }));
		expect(renderCount).toBe(1);

		// Updating the watched template should cause re-render with new info
		await act(() => setTemplateInfo(1, { template: '*{{{0}}}' }));
		expect(result.current).toEqual({
			id: 1,
			...firstTemplateInfo,
			template: '*{{{0}}}',
		});
	});

	test('when the argument changes, returns updated information', () => {
		const {
			rerender,
			result,
		} = renderHook(
			(templateId) => useTemplateInfo(templateId),
			{ initialProps: 1 }
		);
		expect(result.current).toEqual({
			id: 1,
			...firstTemplateInfo,
		});


		rerender(2);
		expect(result.current).toEqual({
			id: 2,
			...secondTemplateInfo,
		});
	});
});
