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

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { insertTestData } from '../../test-utils';
import type { Day } from '../../types';

import { useSettableDay } from './useSettableDay';

describe('useSettableDay', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide a SettableAsyncDataResult', () => {
		const { result } = renderHook(
			() => useSettableDay(1)
		);

		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: false,
		});
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useSettableDay(1)
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					year: 2026,
					month: 4,
					day: 26,
					note: 'Test note 1',
				} satisfies Day,
			});
		});
	});

	describe('re-fetches data if it changes', () => {
		test('when the day is changed', async () => {
			const { result } = renderHook(
				() => useSettableDay(1)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						year: 2026,
						month: 4,
						day: 26,
						note: 'Test note 1',
					} satisfies Day,
				});
			});

			save([{
				type: SaveType.DAY,
				id: 1,
				day: {
					note: 'Test day 1 note updated',
				},
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						year: 2026,
						month: 4,
						day: 26,
						note: 'Test day 1 note updated',
					} satisfies Day,
				});
			});
		});

		test('when the day is removed', async () => {
			const { result } = renderHook(
				() => useSettableDay(1)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 1,
						year: 2026,
						month: 4,
						day: 26,
						note: 'Test note 1',
					} satisfies Day,
				});
			});

			save([{
				type: SaveType.DAY_DELETE,
				id: 1,
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.ERROR,
					loading: false,
					error: new Error('Could not find day with ID 1'),
				});
			});
		});

		test('when the day is created', async () => {
			const { result } = renderHook(
				() => useSettableDay(4)
			);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.ERROR,
					loading: false,
					error: new Error('Could not find day with ID 4'),
				});
			});

			save([{
				type: SaveType.DAY_ADD,
				day: {
					year: 2026,
					month: 10,
					day: 9,
					note: '',
				},
			}]);

			await waitFor(() => {
				expect(result.current.stateOfGet).toEqual({
					type: AsyncDataStateType.SUCCESS,
					loading: false,
					data: {
						id: 4,
						year: 2026,
						month: 10,
						day: 9,
						note: '',
					} satisfies Day,
				});
			});
		});
	});

	test('re-fetches data if provided a new day task ID', async () => {
		const { rerender, result } = renderHook(
			(taskId) => useSettableDay(taskId),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					year: 2026,
					month: 4,
					day: 26,
					note: 'Test note 1',
				} satisfies Day,
			});
		});

		rerender(2);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: true,
				data: {
					id: 1,
					year: 2026,
					month: 4,
					day: 26,
					note: 'Test note 1',
				} satisfies Day,
			});
		});

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 2,
					year: 2026,
					month: 4,
					day: 27,
					note: 'Test note 2',
				} satisfies Day,
			});
		});
	});

	test('can set data and provide optimistic results', async () => {
		const { rerender, result } = renderHook(
			(dayTask) => useSettableDay(dayTask),
			{ initialProps: 1 }
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					year: 2026,
					month: 4,
					day: 26,
					note: 'Test note 1',
				} satisfies Day,
			});
		});

		result.current.setData({ note: 'Test day 1 note updated' });
		rerender(1);

		// While the set function processes, we have optimistic data
		expect(result.current.stateOfSet).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
		expect(result.current.stateOfGet).toEqual({
			type: AsyncDataStateType.SUCCESS,
			loading: false,
			data: {
				id: 1,
				year: 2026,
				month: 4,
				day: 26,
				note: 'Test day 1 note updated',
			} satisfies Day,
		});

		// Eventually, the set function completes and we still have data
		await waitFor(() => {
			expect(result.current.stateOfSet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
			});
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					year: 2026,
					month: 4,
					day: 26,
					note: 'Test day 1 note updated',
				} satisfies Day,
			});
		});
	});

	test('enters error state if day task could not be found', async () => {
		const { result } = renderHook(
			() => useSettableDay(-1),
		);

		await waitFor(() => {
			expect(result.current.stateOfGet).toEqual({
				type: AsyncDataStateType.ERROR,
				error: new Error('Could not find day with ID -1'),
				loading: false,
			} satisfies AsyncDataState<Day>);
		});
	});
});
