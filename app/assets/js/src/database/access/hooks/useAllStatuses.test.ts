import {
	afterEach,
	beforeEach,
	describe,
	expect,
	test,
} from '@jest/globals';
import {
	cleanup,
	renderHook,
	waitFor,
} from '@testing-library/preact';

import { AsyncActionStateType, type AsyncActionState } from 'utils/asyncAction';

import type { Status } from '../../types';
import { insertTestData } from '../../test-utils';
import { defaultStatuses } from '../../migration';

import { useAllStatuses } from './useAllStatuses';

describe('useAllStatuses', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide an AsyncActionState', () => {
		const { result } = renderHook(
			() => useAllStatuses()
		);

		expect(result.current).toEqual({
			type: AsyncActionStateType.INITIAL,
			loading: true,
			progress: null,
		} satisfies AsyncActionState<readonly Status[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useAllStatuses()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: defaultStatuses,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<readonly Status[]>);
		});
	});

	test('provides a success result immediately on subsequent initial renders', async () => {
		const { result } = renderHook(
			() => useAllStatuses()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncActionStateType.SUCCESS,
				data: defaultStatuses,
				loading: false,
				progress: null,
			} satisfies AsyncActionState<readonly Status[]>);
		});

		const { result: result2 } = renderHook(
			() => useAllStatuses()
		);

		expect(result2.current).toEqual({
			type: AsyncActionStateType.SUCCESS,
			data: defaultStatuses,
			loading: false,
			progress: null,
		} satisfies AsyncActionState<readonly Status[]>);
	});
});
