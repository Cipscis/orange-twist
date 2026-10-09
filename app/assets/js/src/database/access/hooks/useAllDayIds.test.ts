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

import { AsyncDataStateType, type AsyncDataState } from 'utils';

import { insertTestData } from '../../test-utils';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { useAllDayIds } from './useAllDayIds';

describe('useAllDayIds', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useAllDayIds()
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		} satisfies AsyncDataState<number[]>);
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useAllDayIds()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [3, 1, 2],
			} satisfies AsyncDataState<number[]>);
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when adding a day', async () => {
			const { result } = renderHook(
				() => useAllDayIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 1, 2],
				} satisfies AsyncDataState<number[]>);
			});

			save([{
				type: SaveType.DAY_ADD,
				day: {
					year: 2026,
					month: 9,
					day: 29,
					note: 'New day',
				},
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 1, 2, 4],
				} satisfies AsyncDataState<number[]>);
			});
		});
		test('when deleting a day', async () => {
			const { result } = renderHook(
				() => useAllDayIds()
			);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 1, 2],
				} satisfies AsyncDataState<number[]>);
			});

			save([{
				type: SaveType.DAY_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: [3, 2],
				} satisfies AsyncDataState<number[]>);
			});
		});
	});
});
