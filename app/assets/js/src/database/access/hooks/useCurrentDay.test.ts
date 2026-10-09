import {
	afterEach,
	beforeEach,
	describe,
	expect,
	jest,
	test,
} from '@jest/globals';
import {
	cleanup,
	renderHook,
	waitFor,
} from '@testing-library/preact';

import { AsyncDataStateType } from 'utils';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { insertTestData } from '../../test-utils';
import type { Day } from '../../types';

import { useCurrentDay } from './useCurrentDay';

describe('useCurrentDay', () => {
	beforeEach(async () => {
		jest.useFakeTimers({
			advanceTimers: true,
		}).setSystemTime(
			new Date(2026, 8, 29, 8)
		);

		await insertTestData({
			day: {
				1: {
					id: 1,
					year: 2026,
					month: 9,
					day: 29,
					note: 'Test day note',
				},
			},
		});
	});
	afterEach(() => {
		jest.useRealTimers();
		cleanup();
	});

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useCurrentDay()
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
	});

	test('when current day exists, fetches it on initial render', async () => {
		const { result } = renderHook(
			() => useCurrentDay()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					year: 2026,
					month: 9,
					day: 29,
					note: 'Test day note',
				} satisfies Day,
			});
		});
	});

	test('when current day does not exist, creates and fetches it on initial render', async () => {
		jest.setSystemTime(
			new Date(2026, 8, 30, 8)
		);

		const { result } = renderHook(
			() => useCurrentDay()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 4,
					year: 2026,
					month: 9,
					day: 30,
					note: '',
				} satisfies Day,
			});
		});
	});

	test('re-fetches data if it changes', async () => {
		const { result } = renderHook(
			() => useCurrentDay()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					year: 2026,
					month: 9,
					day: 29,
					note: 'Test day note',
				} satisfies Day,
			});
		});

		save([{
			type: SaveType.DAY,
			id: 1,
			day: {
				note: 'Updated day note',
			},
		}]);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: {
					id: 1,
					year: 2026,
					month: 9,
					day: 29,
					note: 'Updated day note',
				} satisfies Day,
			});
		});
	});
});
