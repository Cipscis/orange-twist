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

import { AsyncDataStateType } from 'utils';

import { insertTestData } from '../../test-utils';
import { defaultStatuses } from '../../migration';

import { useAllStatuses } from './useAllStatuses';

describe('useAllStatuses', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useAllStatuses()
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useAllStatuses()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: defaultStatuses,
			});
		});
	});

	test('provides a success result immediately on subsequent initial renders', async () => {
		const { result } = renderHook(
			() => useAllStatuses()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: defaultStatuses,
			});
		});

		const { result: result2 } = renderHook(
			() => useAllStatuses()
		);

		expect(result2.current).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: defaultStatuses,
		});
	});
});
