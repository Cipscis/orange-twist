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
import type { Day } from '../../types';

import { save } from '../save';
import { SaveType } from '../SaveAction';

import { useAllDays } from './useAllDays';

describe('useAllDays', () => {
	beforeEach(async () => insertTestData());
	afterEach(() => cleanup());

	test('provide an AsyncDataResult', () => {
		const { result } = renderHook(
			() => useAllDays()
		);

		expect(result.current).toEqual({
			type: AsyncDataStateType.INITIAL,
			loading: true,
		});
	});

	test('fetches data on initial render', async () => {
		const { result } = renderHook(
			() => useAllDays()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [
					{
						id: 3,
						year: 2026,
						month: 1,
						day: 1,
						note: 'Test note 3',
					},
					{
						id: 1,
						year: 2026,
						month: 4,
						day: 26,
						note: 'Test note 1',
					},
					{
						id: 2,
						year: 2026,
						month: 4,
						day: 27,
						note: 'Test note 2',
					},
				] satisfies Day[],
			});
		});
	});

	test('re-fetches data if it changes', async () => {
		const { result } = renderHook(
			() => useAllDays()
		);

		await waitFor(() => {
			expect(result.current).toEqual({
				type: AsyncDataStateType.SUCCESS,
				loading: false,
				data: [
					{
						id: 3,
						year: 2026,
						month: 1,
						day: 1,
						note: 'Test note 3',
					},
					{
						id: 1,
						year: 2026,
						month: 4,
						day: 26,
						note: 'Test note 1',
					},
					{
						id: 2,
						year: 2026,
						month: 4,
						day: 27,
						note: 'Test note 2',
					},
				] satisfies Day[],
			});
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
				data: [
					{
						id: 3,
						year: 2026,
						month: 1,
						day: 1,
						note: 'Test note 3',
					},
					{
						id: 1,
						year: 2026,
						month: 4,
						day: 26,
						note: 'Test note 1',
					},
					{
						id: 2,
						year: 2026,
						month: 4,
						day: 27,
						note: 'Test note 2',
					},
					{
						id: 4,
						year: 2026,
						month: 9,
						day: 29,
						note: 'New day',
					},
				] satisfies Day[],
			});
		});
	});
});
